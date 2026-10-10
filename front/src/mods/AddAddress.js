import {useLanguage} from '../language';
import React, { useState, useEffect, useContext } from 'react';
import Cookies from "universal-cookie";
import { ThemeContext } from './themeprovider';
const cookies = new Cookies();
const token = cookies.getAll().token;
const isFarsi = cookies.getAll().Lang === 'fa';

const AddAddress = () => {
  const {t} = useLanguage();
    const [isdataCorr, setisdataCorr] = useState(true);
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
    const theme = useContext(ThemeContext); 
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [iranData, setIranData] = useState({});
    const [loading,setLoading] = useState('opacity-0')
    const [formData, setFormData] = useState({
        token:cookies.getAll().token,
        fname: '',
        lname: '',
        PostalCode: '',
        address: '',
        phoneNumber: '',
        email: '',
        city:'',
        state:''
    });

    const [timerStarted, setTimerStarted] = useState(false); 
    const [added, setAdded] = useState('translate-y-full opacity-0');
    const [status,setStatus] = useState([' alert-error ','login failed',false]);
    
    const handleInputChange = (event) => {
      const { name, value } = event.target;
      
      if (name === "PostalCode" && !/^\d{10}$/.test(value)) {
          // Postal code is not a 10-digit number, you can handle this error as needed
          // For example, display an error message to the user
          // You can also prevent further processing of the form
          
          // or disable the submit button until the input is correct
          setStatus(['alert-error','کد پستی را به درستی وارد کنید' , false]);
          setAdded('translate-y-0 opacity-1');
          setTimerStarted(true);
          setisdataCorr(true)

        }

        else if (name === "phoneNumber" && !/^\d{11}$/.test(value)) {
          // Phone number doesn't match the expected format (e.g., 10 digits)
          // You can handle this error similarly to the Postal Code validation
          setStatus(['alert-error','شماره تلفن باید 11 رقم باشد' , false]);
          setAdded('translate-y-0 opacity-1');
          setTimerStarted(true);
          setisdataCorr(true)

    }else{
        setisdataCorr(false)
    }
      setFormData({
          ...formData,
          [name]: value,
      });
  };

    useEffect(() => {
      let timer;
      if (timerStarted) {
        timer = setTimeout(() => {
          setAdded(' translate-y-full opacity-0');
          setTimerStarted(false);
        }, 2000);
      }
  
      return () => {
        clearTimeout(timer);
      };
    }, [timerStarted]);


    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent the default form submission behavior
        
        try {
            const response = await fetch(`http://127.0.0.1:2000/auth/add_address/`, {
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
    
    const requiredFields = ["fname", "lname", "PostalCode", "address", "phoneNumber", "city", "state"];

    // State variable to track whether the submit button should be disabled

  
    // Validation function to check if all required fields are filled
    const areAllFieldsFilled = () => {
      for (const field of requiredFields) {
        if (!formData[field]) {
          return false;
        }
      }
      return true;
    };
  
    // Effect to update the submit button state whenever the form data changes
    useEffect(() => {
      setIsSubmitDisabled(!areAllFieldsFilled());
    }, [formData]);

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
        <div className={` flex justify-center flex-col items-center bg-base-100 w-full ${isFarsi?'font-yek':' font-mont font-thin '} p-10 `} data-theme={theme}>
            <h1 className='text-3xl p-5'>{t('اضافه کردن ادرس', 'Add address')}</h1>
            <div className=" bg-secondary p-8 rounded shadow-md sm:w-1/2 ">

                <form onSubmit={handleSubmit} >
                    <div className='grid lg:grid-cols-2 grid-cols-1 gap-2'>
                            <div className="mb-4">
                                <label htmlFor="lname" className="block text-sm  text-accent">{isFarsi?"نام خانوادگی":'Last Name'}</label>
                                <input
                                    type="text"
                                    autoComplete='Last Name'
                                    id="lname"
                                    name="lname" 
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
                                    id="postalCode"
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
                                                <option value="" disabled>{isFarsi?'یک استان را انتخاب کنید':'Select a state'}</option>
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
                                                <option value="" disabled>{isFarsi?'یک شهر را انتخاب کنید':'Select a city'}</option>
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
                                    className=
                                    {`bg-accent text-center items-center 
                                    flex justify-between text-base-100 
                                    border-2 border-base-100 px-4 py-2
                                    w-full rounded-sm transition-all
                                    ${isSubmitDisabled || isdataCorr ? "opacity-30":" hover:text-accent   hover:bg-base-100 "}`}
                                    disabled={isSubmitDisabled || isdataCorr}
                                >
                                    <div></div>
                                    <span>
                                    ثبت آدرس
                                    </span>
                                <span className={"loading loading-spinner loading-lg "+loading}></span>
                                </button>
                           </div>
                </form>
            </div>
            <div 
            className={
            `alert transform ${status[0]} ease-in  transition-all
             duration-300 bottom-0 my-10 left-0 right-0 fixed ${added}`}>

              {!status[2]&& 
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                }
              {status[2]&&
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                } 
              <span>{status[1]}</span>
              {status[2]&&
                <span className="loading loading-spinner loading-sm"></span>
                } 
            </div>
        </div>

            
    );
};

export default AddAddress;
