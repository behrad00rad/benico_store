import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Cookies from "universal-cookie";

import { ThemeContext } from './themeprovider';
const IAddressForm = () => {
    const theme = useContext(ThemeContext);
    const isFarsi = true
    const cookies = new Cookies()
    const [selectedState, setSelectedState] = useState('');
    const [loading,setLoading] = useState('opacity-0')
    const [selectedCity, setSelectedCity] = useState('');
    const [iranData, setIranData] = useState({});
    const {id} = useParams()
    const token = cookies.getAll().token 
    useEffect(() => {
        const loadAddress = async (token) => {
          try {
            const response = await fetch(`http://127.0.0.1:2000/auth/get_address_id/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              }, 
              body: JSON.stringify({ token: token,AID:id }),
            });
            const data = await response.json();

            setFormData({
                token:token,
                id: data[0].id,
                fname: data[0].fname,
                lname: data[0].lname,
                PostalCode: data[0].postal_code,
                address: data[0].address,
                phoneNumber: data[0].phone_number,
                email: data[0].email,
                city: data[0].city,
                state: data[0].state,
            });
            setSelectedCity(data[0].city)
            setSelectedState(data[0].state)
            console.log(data[0])
          } catch (error) {
            console.error('Error fetching:', error);
          }
        };
    
        loadAddress(token);
      }, []);

      const [formData, setFormData] = useState({
        id: id,
        token:token,
        fname: '',
        lname: '',
        PostalCode: '',
        address: '',
        phoneNumber: '',
        email: '',
        city: '',
        state: '',
    });
    

    const handleInputChange = (event) => {
    
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent the default form submission behavior
        
        try {
            const response = await fetch(`http://127.0.0.1:2000/auth/edit_address/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const res = await response.json();
            setLoading('')
            setTimeout(() => {
                // Redirect to another page using the history object
                window.location.href = '/dashboard/address/';
              }, 1000); // Delay in milliseconds (2 seconds)
            
            // Now you can do something with the 'res' data
        } catch (error) {
            console.error('Error fetching:', error);
        }
    };
    


    useEffect(() => {

        // Load the data from the iran-data.json file
        fetch(`http://127.0.0.1:2000/auth/get_loc/`)
            .then(response => response.json())
            .then(data => { setIranData(data)})
            .catch(error => console.error('Error loading data:', error));
    }, []);

    const handleStateChange = (event) => {
        const state = event.target.value;
        setSelectedState(state);
        setSelectedCity('');
        setFormData({
            ...formData,
            ['state']: state
        });
    };

    const handleCityChange = (event) => {
        const city = event.target.value;
        setSelectedCity(city);
        setFormData({
            ...formData,
            ['city']: city
        });
    };

    return (
        <div className={` flex flex-col justify-center items-center p-5 w-full ${isFarsi?'font-yek':' font-mont font-thin '} `} data-theme={theme} >
           <h1 className='text-3xl p-5'>ویرایش ادرس</h1>
            <div className=" sm:w-1/2 bg-secondary p-10 rounded shadow-md ">

                <form  onSubmit={handleSubmit} >
                    <div className='grid sm:grid-cols-2 grid-cols-1 gap-2'>
                            <div className="mb-4">
                                <label htmlFor="lname" className="block text-sm  text-accent">{isFarsi?"نام خانوادگی":'Last Name'}</label>
                                <input
                                    type="text"
                                    autoComplete='Last Name'
                                    id="lname"
                                    name="Last name"
                                    value={formData.lname}
                                    onChange={handleInputChange}
                                    className="mt-1 p-2 w-full  rounded-sm bg-base-100 "
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="fname" className="block text-sm  text-accent">{isFarsi?'نام':'First Name'}</label>
                                <input
                                    autoComplete='First Name'
                                    type="text"
                                    id="fname"
                                    name="fname"
                                    value={formData.fname}
                                    onChange={handleInputChange}
                                    className="mt-1 p-2 w-full  rounded-sm bg-base-100 "
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="postalCode" className=" block text-sm  text-accent">{isFarsi?"کد پستی":'Postal Code'}</label>
                                <input
                                    type="text"
                                    id="PostalCode"
                                    name="PostalCode"
                                    value={formData.PostalCode} 
                                    onChange={handleInputChange}
                                    className="mt-1 p-2 w-full rounded-sm bg-base-100"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="phoneNumber" className="block text-sm text-accent   ">{isFarsi?'شماره همراه':"Phone Number"}</label>
                                <input
                                    type="text"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    className="mt-1 p-2 w-full  rounded-sm  bg-base-100  "
                                    required
                                />
                            </div>
                            <div>
                                    <label htmlFor="state" className="block text-sm text-accent  ">{isFarsi?"استان":'state'}</label>
                                    <select 
                                        className='w-full bg-base-100 p-2 text-accent'
                                        id="state"
                                        name="state"
                                        value={selectedState} 
                                        onChange={handleStateChange}
                                    >
                                                <option value="" className='text-xs' disabled>{isFarsi?'یک استان را انتخاب کنید':'Select a state'}</option>
                                                {Object.keys(iranData).map((state) => (
                                                    <option key={state} value={state}>
                                                        {state}
                                                    </option>
                                                ))}
                                    </select>
                                </div>
                            <div>
                                    <label htmlFor="city" className="block text-sm text-accent  ">{isFarsi?"شهر":'city'}</label>
                                    <select
                                        className='w-full bg-base-100 p-2 text-accent'
                                        id="city" 
                                        name="city" 
                                        value={selectedCity} 
                                        onChange={handleCityChange} 
                                        disabled={!selectedState}
                                        >
                                                <option value="" className='text-xs'  disabled>{isFarsi?'شهر را انتخاب کنید':'Select a city'}</option>
                                                {selectedState && iranData[selectedState].map((city) => (
                                                    <option key={city} value={city}>
                                                        {city}
                                                    </option>
                                                ))}
                                    </select>
                            </div>
                    </div>
                            <div className="mb-4">
                                <label htmlFor="address" className="block text-sm text-accent   ">{isFarsi?'آدرس':'Address'}</label>
                                <textarea 
                                    class="textarea mt-1 p-2 w-full  rounded-sm "
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required>
                                    </textarea>
                             </div>
                             <div className="mt-6">
                             <button
                                    type="submit"
                                    className="bg-accent text-center items-center flex justify-between text-base-100 border-2 border-base-100 px-4 py-2 w-full rounded-sm hover:bg-base-100 hover:text-accent transition-all "
                                >
                                    <div></div>
                                    <span>
                                    ویرایش
                                    </span>
                                <span className={"loading loading-spinner loading-lg "+loading}></span>
                                </button>
                           </div>
                </form>
            </div>
        </div>

            
    );
};

export default IAddressForm;
