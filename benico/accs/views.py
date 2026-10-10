from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import addresses, userinfo,OrderP
from .models import userinfo, addresses,order
from product.models import item
from django.core.mail import send_mail
from django.core.exceptions import ObjectDoesNotExist
import re,string,json,logging,requests

logger = logging.getLogger(__name__)
@api_view(['POST'])
def PasswordReset(request):
        # The old handler replaced passwords before attempting delivery through
        # placeholder SMTP settings. Keep passwords intact until reset email is configured.
        return Response({'message': 'Password reset email is not configured. Contact the store administrator.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)



def is_valid_email(email):
    # Regular expression to validate email addresses
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    # Use the re.match() function to check if the email matches the pattern
    return re.match(email_pattern, email) is not None


@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    if not email or not password: return Response({'error': 'Enter your username and password'},status=status.HTTP_400_BAD_REQUEST)
    if is_valid_email(email):
        try:
            username = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'invalid email'}, status=status.HTTP_401_UNAUTHORIZED) 
    if not is_valid_email(email):
        username= email
    
    user = authenticate(username=username, password=password) 

    if user:
        token, _ = Token.objects.get_or_create(user=user)
        userinfo.objects.get_or_create(user=user, defaults={'token': token.key})
        return Response({'token': token.key, 'user': {'username': user.username, 'is_staff': user.is_staff}, 'redirect': '/admin/' if user.is_staff else '/dashboard/detail/'}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'incorrect password'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')

    if not username or not password:
        return Response({'error': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_409_CONFLICT)

    user = User.objects.create_user(username=username, email=email, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        userinfo.objects.create(user=user, token=token.key)
        return Response({'message': 'User created successfully','token':token.key}, status=status.HTTP_201_CREATED)
    else:
        return Response({'error': 'User creation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['POST'])
def get_user_info(request):
    token = request.data.get('token')
    info = userinfo.objects.all().filter(token=token)
    res = []
    for i in info:
        res.append({
            'username':i.user.username,
            'is_staff':i.user.is_staff,
            })
    return  Response(res,status.HTTP_200_OK)


@api_view(['POST'])
def get_user_address(request): 
    res = []
    token = request.data.get('token')
    try:
            user_info = userinfo.objects.get(token=token)
            user = user_info.user
            address = addresses.objects.filter(user=user)
            address = addresses.objects.all().filter(user=user)
            for a in address:
                res.append(
                    {
                        'id':a.id,
                        'address':a.address,
                        'fname':a.Fname,
                        'lname':a.Lname,
                        'state': a.state,
                        'city':a.city,
                        'phone_number' : a.Phone_number,
                        'postal_code':a.PostalCode 

                    }
                )
            return  Response(res,status.HTTP_200_OK)
    except addresses.DoesNotExist or user_info.DoesNotExist:
            return Response({'message': 'Address not found'}, status=status.HTTP_404_NOT_FOUND)
    

@api_view(['POST'])
def get_address(request): 
    res = []
    token = request.data.get('token')
    AID = request.data.get('AID')
    try:
            user_info = userinfo.objects.get(token=token)
            user = user_info.user
            address = addresses.objects.filter(user=user,id=AID)
            for a in address:
                res.append(
                    {
                        'id':a.id,
                        'address':a.address,
                        'fname':a.Fname,
                        'lname':a.Lname,
                        'state': a.state,
                        'city':a.city,
                        'phone_number' : a.Phone_number,
                        'postal_code':a.PostalCode 

                    }
                )
            return  Response(res,status.HTTP_200_OK)
    except addresses.DoesNotExist or user_info.DoesNotExist:
            return Response({'message': 'Address not found'}, status=status.HTTP_404_NOT_FOUND)
    


@api_view(['POST'])
def get_user_detail(request):
    token = request.data.get('token')
    user_info = userinfo.objects.get(token=token)
    user = user_info.user
    address = addresses.objects.filter(user=user)
    
    res = {}
    
    if address.exists():
        a = address.first()  # Assuming you only need the first address if available
        res['fname'] = a.Fname
        res['lname'] = a.Lname
        res['PhoneNum'] = a.Phone_number
    else:
        res['fname'] = '-'
        res['lname'] = '-'
        res['PhoneNum'] = '--'
    
    res["email"] = User.objects.get(username=user).email

    return Response(res, status=status.HTTP_200_OK)


import json,os


@api_view(['GET'])
def get_loc(request):
    file_path = os.path.join(os.path.dirname(__file__), 'Firandata.json')
    with open(file_path,encoding='utf-8') as f:
            data = json.load(f)

    return Response(data)    


@api_view(['POST'])
def delete_address(request):
    token = request.data.get('token')
    Aid = request.data.get('AddressID')
    user_info = userinfo.objects.get(token=token)
    user = user_info.user
    try:
        address = addresses.objects.get(user=user, id=Aid)
        address.delete()  # Corrected usage of delete() method
        return Response({'message': 'Address deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    except addresses.DoesNotExist:
        return Response({'message': 'Address not found'}, status=status.HTTP_404_NOT_FOUND)
    
import random 
@api_view(['POST'])
def add_address(request):
    token = request.data.get('token')
    address = request.data['address']
    state = request.data['state']
    PostalCode = request.data['PostalCode']
    city = request.data['city']
    fname = request.data['fname']
    lname = request.data['lname']
    phoneNum = request.data['phoneNumber']

    try:
        user_info = userinfo.objects.get(token=token)
        user = user_info.user
        addresses.objects.create(
            id=random.randint(10000, 99999),
            user=user,
            Fname=fname,
            Lname=lname,
            Phone_number=phoneNum,
            address=address,
            state=state,
            city=city,
            PostalCode=PostalCode
        )
        return Response({'message': 'Address added successfully'}, status=status.HTTP_201_CREATED)
    except userinfo.DoesNotExist:
        return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except addresses.DoesNotExist:
        return Response({'message': 'Address not found'}, status=status.HTTP_404_NOT_FOUND)
    



@api_view(['POST'])
def edit_address(request):
    try:
        print(request.data)
        # Get token and address_id from the request data
        token = request.data.get('token')
        address_id = request.data.get('id')  # Change to 'address_id'

        # Fetch the user's information based on the token
        user_info = userinfo.objects.get(token=token)
        user = user_info.user

        # Check if the address with the given address_id exists and belongs to the user
        address = addresses.objects.get(id=address_id, user=user)
        print(address)

        # Update address details with the provided data
        address.address = request.data['address']
        address.state = request.data['state']
        address.PostalCode = request.data['PostalCode']
        address.city = request.data['city']
        address.Fname = request.data['fname']
        address.Lname = request.data['lname']
        address.Phone_number = request.data['phoneNumber']
        print(address.Fname)
        # Save the updated address
        address.save()
        
        return Response({'message': 'Address updated successfully'}, status=status.HTTP_200_OK)

    except ObjectDoesNotExist as e:
        logger.error(f"Object does not exist: {e}")
        return Response({'error': 'Object does not exist'}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.error(f"Error: {e}")
        return Response({'error': 'An error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
import random

from django.db import transaction, IntegrityError
from django.db.models import F

@api_view(['POST'])
def submit_order(request):
    from .customer_views import delivery_values
    import uuid, hashlib
    token = request.data.get('token', '')
    user = None
    if token:
        try:
            user = Token.objects.select_related('user').get(key=token, user__is_active=True).user
        except Token.DoesNotExist:
            return Response({'error': 'Please sign in again'}, status=401)
    delivery, errors = delivery_values(request.data)
    if errors:
        return Response({'error': 'Check the delivery information', 'fields': errors}, status=400)
    lines = request.data.get('products')
    if not isinstance(lines, list) or not lines:
        return Response({'error': 'Your bag is empty'}, status=400)
    quantities = {}
    try:
        for line in lines:
            if not isinstance(line, list) or len(line) != 1:
                raise ValueError()
            data = line[0]
            product_id = int(data['productId'])
            quantity = data['productQ']
            size = data['productS']
            if isinstance(quantity, bool) or not isinstance(quantity, int) or quantity < 1 or size not in ('L', 'XL', 'XXL'):
                raise ValueError()
            key = (product_id, size)
            quantities[key] = quantities.get(key, 0) + quantity
    except (KeyError, IndexError, TypeError, ValueError):
        return Response({'error': 'Invalid product, size or quantity'}, status=400)
    checkout_key = request.data.get('checkout_key')
    if checkout_key:
        try:
            checkout_key = uuid.UUID(str(checkout_key))
        except ValueError:
            return Response({'error':'Invalid checkout reference'},status=400)
    fingerprint = hashlib.sha256(json.dumps({'user':user.pk if user else None, 'delivery':delivery,
        'lines':sorted((key[0],key[1],quantity) for key,quantity in quantities.items())},sort_keys=True).encode()).hexdigest()
    def existing_response(record):
        if record.checkout_fingerprint != fingerprint:
            return Response({'error':'This checkout reference belongs to a different order. Refresh checkout.'},status=409)
        return Response({'success':True,'order_id':record.pk,'paid':record.paid},status=201)
    if checkout_key:
        previous = order.objects.filter(checkout_key=checkout_key).first()
        if previous:
            return existing_response(previous)
    try:
        with transaction.atomic():
            products = {p.id: p for p in item.objects.filter(id__in=[key[0] for key in quantities])}
            total = 0
            for (product_id, size), quantity in quantities.items():
                product = products.get(product_id)
                if product is None:
                    raise ValueError('Product no longer exists')
                field = size + '_count'
                updated = item.objects.filter(pk=product_id, **{field + '__gte': quantity}).update(**{field: F(field) - quantity})
                if not updated:
                    raise ValueError('Not enough stock for the selected size')
                total += (product.price or 0) * quantity
            identifier = random.randint(10000000, 99999999)
            while order.objects.filter(pk=identifier).exists():
                identifier = random.randint(10000000, 99999999)
            new_order = order.objects.create(order_id=identifier, user=user, price=total, paid=False,
                address=delivery['address'], state=delivery['state'], city=delivery['city'],
                Fname=delivery['fname'], Lname=delivery['lname'],
                PostalCode=delivery['PostalCode'], Phone_number=delivery['phoneNumber'],
                checkout_key=checkout_key, checkout_fingerprint=fingerprint)
            for (product_id, size), quantity in quantities.items():
                line = OrderP.objects.create(order_id=identifier, product=products[product_id], Q=quantity, size=size)
                new_order.products.add(line)
    except IntegrityError:
        previous = order.objects.filter(checkout_key=checkout_key).first() if checkout_key else None
        if previous:
            return existing_response(previous)
        raise
    except ValueError as error:
        return Response({'error': str(error)}, status=409)
    return Response({'success': True, 'order_id': identifier, 'paid': False}, status=201)

@api_view(['POST'])
def get_orders(request):
    token = request.data.get('token')
    try:
        user_info = userinfo.objects.get(token=token)
    except userinfo.DoesNotExist:
        return Response({'error': 'Please sign in to view orders'}, status=status.HTTP_401_UNAUTHORIZED)
    user = user_info.user 
    orders = order.objects.filter(user=user)
    orders_data = []
    
    for o in orders:
        products = [f"{product.product.title} x {product.Q} ({product.size})" for product in o.products.all()]

        orders_data.append({
            'products': products,
            'order_id': o.order_id,
            'price': o.price,
            'paid': o.paid,
            'date': o.date,
            'address': o.address,
            'fname': o.Fname,
            'lname': o.Lname,
            'state': o.state, 
            'city': o.city,
            'phone_number': o.Phone_number,
            'postal_code': o.PostalCode
        })

    return Response({'orders': orders_data[::-1]})
 

@api_view(["GET"])
def verify(request):
    # Define the JSON data you want to send in the request
    if request.query_params.get('Status','') == "OK":
        return Response(request.query_params.get('Authority',''))
    else:
        data = {
        "merchant_id": "YOUR_MERCHANT_ID", 
        "authority": request.query_params.get('Authority',''),
    }

    # Set the headers to specify that you are sending JSON data
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json", 
    }

    # Make the JSON POST request to the ZarinPal API
    # response = requests.post(
    #     url="https://api.zarinpal.com/pg/v4/payment/verify.json",
    #     data=json.dumps(data),
    #     headers=headers,
    # )

    # Check if the request was successful (status code 200)
    # if response.status_code == 200:
    #     response_data = response.json()
    #     # Process the response data as needed
    #     # For example, you can return it as a JSON response to your client
    #     return Response("درحال بازگرداندن شما به سایت پذیرنده")
    # else:
    #     # Handle the case where the request was not successful
    #     return Response({"error": "Failed to verify payment"}, status=response.status_code)
