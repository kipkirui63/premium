# Backend Updates for Monthly/Yearly Subscription Plans

## Updated Models

```python
# models.py
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    phone = models.CharField(max_length=20, null=True, blank=True)
    role = models.CharField(max_length=20, default='user')
    is_active = models.BooleanField(default=False)

class Tool(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    monthly_price_id = models.CharField(max_length=200)  # Stripe price ID for monthly
    yearly_price_id = models.CharField(max_length=200)   # Stripe price ID for yearly
    monthly_price = models.DecimalField(max_digits=10, decimal_places=2)  # Display price
    yearly_price = models.DecimalField(max_digits=10, decimal_places=2)   # Display price
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Subscription(models.Model):
    PLAN_CHOICES = [
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('canceled', 'Canceled'),
        ('expired', 'Expired'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    tool = models.ForeignKey(Tool, on_delete=models.CASCADE)
    plan_type = models.CharField(max_length=10, choices=PLAN_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    stripe_subscription_id = models.CharField(max_length=200, null=True, blank=True)
    email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'tool', 'status']  # Prevent duplicate active subscriptions
```

## Updated Serializers

```python
# serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Tool, Subscription

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['email'], password=data['password'])
        if user is None:
            raise serializers.ValidationError("Invalid email or password")
        return user

class ToolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tool
        fields = ['id', 'name', 'description', 'monthly_price_id', 'yearly_price_id', 
                 'monthly_price', 'yearly_price', 'is_active']

class SubscriptionSerializer(serializers.ModelSerializer):
    tool_name = serializers.CharField(source='tool.name', read_only=True)
    tool_description = serializers.CharField(source='tool.description', read_only=True)
    
    class Meta:
        model = Subscription
        fields = ['id', 'tool', 'tool_name', 'tool_description', 'plan_type', 
                 'status', 'created_at', 'updated_at']
```

## Updated Views

```python
# Add these views to your existing views.py

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_checkout(request):
    user = request.user
    tool_id = request.data.get("tool_id")
    plan_type = request.data.get("plan_type", "monthly")  # Default to monthly
    
    if not tool_id:
        return Response({"detail": "Missing tool_id"}, status=400)
    
    if plan_type not in ['monthly', 'yearly']:
        return Response({"detail": "Invalid plan_type. Must be 'monthly' or 'yearly'"}, status=400)

    try:
        tool = Tool.objects.get(id=tool_id)
        
        # Check if user already has an active subscription
        if Subscription.objects.filter(user=user, tool=tool, status="active").exists():
            return Response({"detail": "Already subscribed"}, status=400)
        
        # Select the appropriate price ID based on plan type
        price_id = tool.monthly_price_id if plan_type == 'monthly' else tool.yearly_price_id
        
        session = stripe.checkout.Session.create(
            customer_email=user.email,
            payment_method_types=["card"],
            line_items=[{
                'price': price_id,
                'quantity': 1
            }],
            mode='subscription',
            subscription_data={"trial_period_days": 7},
            success_url="https://marketplace.crispai.ca/?status=success&session_id={CHECKOUT_SESSION_ID}",
            cancel_url="https://marketplace.crispai.ca/?status=canceled",
            metadata={
                "tool_id": str(tool.id),
                "plan_type": plan_type,
                "user_id": str(user.id)
            }
        )
        return Response({"checkout_url": session.url})

    except Tool.DoesNotExist:
        return Response({"detail": "Tool not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_subscriptions(request):
    user = request.user
    subscriptions = Subscription.objects.filter(user=user).select_related('tool')
    serializer = SubscriptionSerializer(subscriptions, many=True)
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_subscription(request):
    user = request.user
    subscription_id = request.data.get("subscription_id")
    
    if not subscription_id:
        return Response({"detail": "subscription_id is required"}, status=400)
    
    try:
        subscription = Subscription.objects.get(
            id=subscription_id,
            user=user,
            status="active"
        )
        
        # Cancel the Stripe subscription if it exists
        if subscription.stripe_subscription_id:
            try:
                stripe.Subscription.modify(
                    subscription.stripe_subscription_id,
                    cancel_at_period_end=True
                )
            except Exception as e:
                print(f"Error canceling Stripe subscription: {e}")
        
        subscription.status = "canceled"
        subscription.save()
        
        return Response({"detail": "Subscription canceled successfully"})
        
    except Subscription.DoesNotExist:
        return Response({"detail": "Active subscription not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
```

## Updated Webhook Handler

```python
@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except Exception:
        return HttpResponse(status=400)

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        email = session.get("customer_email")
        tool_id = session.get("metadata", {}).get("tool_id")
        plan_type = session.get("metadata", {}).get("plan_type", "monthly")
        user_id = session.get("metadata", {}).get("user_id")
        
        try:
            user = User.objects.get(id=user_id)
            tool = Tool.objects.get(id=tool_id)
            
            # Get the subscription ID from Stripe
            subscription_id = session.get("subscription")
            
            Subscription.objects.create(
                user=user,
                tool=tool,
                plan_type=plan_type,
                status="active",
                stripe_subscription_id=subscription_id,
                email=email
            )
        except Exception as e:
            print(f"Error creating subscription: {e}")
            return HttpResponse(status=400)

    elif event["type"] == "customer.subscription.deleted":
        # Handle subscription cancellation
        subscription_data = event["data"]["object"]
        stripe_subscription_id = subscription_data["id"]
        
        try:
            subscription = Subscription.objects.get(
                stripe_subscription_id=stripe_subscription_id,
                status="active"
            )
            subscription.status = "canceled"
            subscription.save()
        except Subscription.DoesNotExist:
            pass

    return HttpResponse(status=200)
```

## Updated URLs

```python
# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register),
    path("login/", views.login),
    path("activate/<uidb64>/<token>/", views.activate, name="activate"),
    path("stripe/create-checkout/", views.create_checkout),
    path("stripe/webhook/", views.stripe_webhook),
    path("auth/check-subscription/", views.check_subscription),
    path("agent/gateway/", views.agent_gateway),
    path("tools/", views.list_tools),
    path('subscriptions/', views.my_subscriptions, name='my-subscriptions'),
    path('subscriptions/cancel/', views.cancel_subscription, name='cancel-subscription'),
]
```