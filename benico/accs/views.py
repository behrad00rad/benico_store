from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import status
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from .models import addresses, userinfo
import re
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from .models import userinfo, addresses,order
from product.models import item

def is_valid_email(email):
    # Regular expression to validate email addresses
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    # Use the re.match() function to check if the email matches the pattern
    return re.match(email_pattern, email) is not None


@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    if (len(email)<1 or len(password)<1) : return Response({'error': 'Bad request'},status=status.HTTP_400_BAD_REQUEST)
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
        return Response({'token': token.key}, status=status.HTTP_200_OK)
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
    

@csrf_exempt
@api_view(['POST'])
def get_user_info(request):
    token = request.data.get('token')
    info = userinfo.objects.all().filter(token=token)
    res = []
    for i in info:
        res.append({
            'username':i.user.username,
            })
    print(res)
    return  Response(res,status.HTTP_200_OK)


@api_view(['POST'])
def get_user_address(request): 
    res = []
    token = request.data.get('token')
    print(token)
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
    print(request.data)
    token = request.data.get('token')
    address_id = request.data.get('id')  # Use 'address_id' instead of 'id'
    address_data = {
        'address': request.data['address'],
        'state': request.data['state'],
        'PostalCode': request.data['PostalCode'],
        'city': request.data['city'],
        'fname': request.data['fname'],
        'lname': request.data['lname'],
        'phoneNumber': request.data['phoneNumber'],  # Use 'phoneNumber' instead of 'phoneNum'
    }

    user_info = userinfo.objects.get(token=token)
    user = user_info.user
    address = addresses.objects.get(id=address_id, user=user)  # Make sure to filter by user
        
        # Update only the address details
    for key, value in address_data.items():
            setattr(address, key, value)
    address.save()  # Save the updated address
        

    return Response({'message': 'Address updated successfully'}, status=status.HTTP_200_OK)



@api_view(['POST'])
def submit_order(request):
        print(request.data)
        token = request.data.get('token','')
        if token:
            user_info = userinfo.objects.get(token=token)
            user = user_info.user 
        else:
            user=None
        
        address = request.data.get('address')
        state = request.data.get('state')
        PostalCode = request.data.get('PostalCode')
        city = request.data.get('city')
        fname = request.data.get('fname')
        lname = request.data.get('lname')
        phoneNumber= request.data.get('phoneNumber')
        product_ids = request.data['product_ids']  # Assuming you're using checkboxes for product selection
        products = item.objects.filter(id__in=product_ids.productId)
        price = sum([product.price for product in products])

        new_order = order(
            order_id=random.randint(1000000,9999999),
            user=user, 
            address=address,
            price=price,
            Fname=fname,
            Lname=lname,
            Phone_number=phoneNumber,
            PostalCode=PostalCode, 
            state=state,
            city=city,
            paid=False
            )
        new_order.save()
        new_order.products.set(products)


        return Response({'success': True},status=status.HTTP_201_CREATED)

@api_view(['POST'])
def get_orders(request):
    token = request.data['token']
    user_info = userinfo.objects.get(token=token)
    user = user_info.user
    orders = order.objects.filter(user=user)
    orders_data = []
    
    for o in orders:
        products_titles = [product.title for product in o.products.all()]
        orders_data.append({
            'products': products_titles,
            'order_id': o.order_id,
            'price': o.price,
            'date': o.date,
            'id': o.id,
            'address': o.address,
            'fname': o.Fname,
            'lname': o.Lname,
            'state': o.state,
            'city': o.city,
            'phone_number': o.Phone_number,
            'postal_code': o.PostalCode
        })

    return Response({'orders': orders_data})


