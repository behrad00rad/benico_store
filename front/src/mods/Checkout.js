import {useLanguage} from '../language';
import Cookies from "universal-cookie";
import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "./themeprovider";
const cookies = new Cookies();

const Checkout = () =>{
  const {t, lang} = useLanguage();
  const [isdataCorr, setisdataCorr] = useState(true);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const token = cookies.getAll().token;
  const isFarsi = cookies.getAll().Lang === 'fa';
    const theme = useContext(ThemeContext);
    const [inverted,setin] = useState()
    useEffect(()=>{setin(theme == "benidark" ? " " : "invert" )},[theme])
    const [DeliveryCost,setDC]=useState(30);
    const [addresses, setAddresses] = useState([]);
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [iranData, setIranData] = useState({});
    
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
          setStatus(['alert-error',t('کد پستی را به درستی وارد کنید', 'Enter a valid postal code') , false]);
          setAdded('translate-y-0 opacity-1');
          setTimerStarted(true);
          setisdataCorr(true)
        }
        else if (name === "phoneNumber" && !/^\d{11}$/.test(value)) {
          // Phone number doesn't match the expected format (e.g., 10 digits)
          // You can handle this error similarly to the Postal Code validation
          setStatus(['alert-error',t('شماره تلفن باید 11 رقم باشد', 'Phone number must contain 11 digits') , false]);
          setAdded('translate-y-0 opacity-1');
          setTimerStarted(true);
          setisdataCorr(true)
        }
        else{setisdataCorr(false)}
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


    useEffect(() => {

      // Load the data from the iran-data.json file
      fetch(`http://127.0.0.1:2000/auth/get_loc/`)
          .then(response => response.json())
          .then(data => { setIranData(data)})
          .catch(error => console.error('Error loading data:', error));
  }, []);

    const [formData, setFormData] = useState({
        token:token?token:null,
        fname: '',
        lname: '',
        PostalCode: '',
        address: '', 
        phoneNumber: '',
        city:'',
        state:'',
        products:cookies.getAll().cartData.map((product)=>[{productId:product.productId,productQ:product.quantity,productS:product.size}])
    });

  

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

  const formatNumberWithCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const calculateTotalPrice = () => {
    let totalPrice = 0;
    cookies.getAll().cartData.forEach((cartItem) => {
      // Assuming that each product has a 'price' property, adjust this according to your actual data structure
      totalPrice += cartItem.price * cartItem.quantity;
    });
    return totalPrice;
  };

  const calall = () =>{
    let totalPrice = 0 ;
    cookies.getAll().cartData.forEach((cartItem) => {
      // Assuming that each product has a 'price' property, adjust this according to your actual data structure
      totalPrice += (cartItem.price * cartItem.quantity);
    });
    return totalPrice;
  }

  useEffect(() => {
      const loadAddress = async (token) => {
        try {
          const response = await fetch(`http://127.0.0.1:2000/auth/get_address/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }, 
            body: JSON.stringify({ token: token }),
          });
          const data = await response.json();
          setAddresses((oldData) => [...oldData, ...data]);
      } catch (error) {
          console.error('Error fetching:', error);
      }
         };
         token&&loadAddress(token)
    },[])

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

    const handleSubmit = async (event) => {
      event.preventDefault(); // Prevent the default form submission behavior
      try {
          const response = await fetch(`http://127.0.0.1:2000/auth/submit_order/`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(formData),
          });
          const res = await response.json();
          if (response.status === 201) {

            setTimeout(() => {
              // Redirect to another page using the history object
              cookies.set('cartData',[],{ path: '/' })
              window.location.href = '/recipte/'+res.order_id+'/';
            }, 1000); // Delay in milliseconds (2 seconds)
          } else {
            setStatus(['alert-error', res.error || t('ثبت سفارش ناموفق بود', 'Unable to place order'), false]);
            setAdded('translate-y-0 opacity-1');
            setTimerStarted(true);
          }
          
          // Now you can do something with the 'res' data
      } catch (error) {
          console.error('Error fetching:', error);
      }
  };

    return(
        <div className={`flex flex-col min-w-screen h-screen ${isFarsi?'font-yek':' font-mont font-thin '} `} data-theme={theme}>
            <div className="p-8 flex items-center justify-center min-w-screen">
                <ul className="steps w-full ">
                        <li className="step step-accent"><a href='/cart/'>{isFarsi?'سبد خرید':'Cart'}</a></li>
                        <li className="step step-accent">{isFarsi?'تسویه حساب':'Address information'}</li>
                        <li className="step">{isFarsi?'تکمیل سفارش':'PROCEED To CHECKOUT'}</li>
                </ul>
            </div>
            <div className="flex flex-col sm:flex-row  bg-base-100">
                <div className="sm:w-3/5">
                      <div className={` gap-5 flex flex-col justify-center bg-base-100 w-full ${isFarsi?'font-yek':' font-mont font-thin '} p-5`}>
                          <div className=" bg-secondary p-8 rounded-sm shadow-md w-full space-y-5 ">
                              <div 
                                    className={"cursor-pointer flex  items-center "+inverted} 
                                    onClick={()=>{setFormData({
                                        token:token,
                                        fname: '',
                                        lname: '',
                                        PostalCode: '',
                                        address: '',
                                        phoneNumber: '',
                                        email: '',
                                        city: '',
                                        state: '',
                                    })
                                    setSelectedCity('')
                                    setSelectedState('')
                                    }}>
                              <svg className="w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.0007 10.5865L16.9504 5.63672L18.3646 7.05093L13.4149 12.0007L18.3646 16.9504L16.9504 18.3646L12.0007 13.4149L7.05093 18.3646L5.63672 16.9504L10.5865 12.0007L5.63672 7.05093L7.05093 5.63672L12.0007 10.5865Z" fill="rgba(255,255,255,1)"></path></svg>       
                              <span className="text-accent">
                                {t('خالی کردن', 'Clear')}
                                </span>
                              </div> 
                              <form >
                                  <div className='grid sm:grid-cols-2 grid-cols-1 gap-2'>
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
                                                  type="number"
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
                                                  type="number"
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
                              </form>
                          </div>
                          {addresses.length>0?<h2>{t('ادرس هایه شما', 'Your addresses')}</h2>:''}
                          <div className="flex items-start">
                              <div className="grid grid-cols-2 w-full gap-3 ">
                              {addresses.map((data) => (
                                <div key={data.id} className="bg-secondary hover:bg-opacity-100 bg-opacity-30 flex cursor-pointer transition-all active:bg-base-100 active:text-accent mb-5"
                                onClick={()=>{
                                  setFormData({
                                  token:token?token:null,
                                  fname: data.fname,
                                  lname: data.lname,
                                  PostalCode: data.postal_code,
                                  address: data.address,
                                  phoneNumber: data.phone_number,
                                  email: data.email, 
                                  city: data.city,
                                  state: data.state,
                                  products:cookies.getAll().cartData.map((product)=>[{productId:product.productId,productQ:product.quantity,productS:product.size}])

                              });
                              setisdataCorr(false)
                              setSelectedCity(data.city)
                              setSelectedState(data.state)
                            
                            }
                              }>    
                                    <span className=" text-center items-center p-5 truncate w-1/2"> {data.address}</span>
                                    <div className="flex-col flex w-full h-full p-4 justify-end items-end text-right">
                                      <h1 className="text-sm">{`${data.fname} ${data.lname}`}</h1>
                                      <span className="text-xs font-extralight font-mont" >{data.postal_code}</span>
                                    </div>
                                </div>          
                                ))}
                              </div>
                          </div>
                      </div>
                </div>
                <div className="p-5 sm:w-2/5 w-full h-fit">
                  <div className=" w-full h-full p-5 flex justify-center flex-col  items-center rounded-sm bg-accent text-base-100">
                    <h1 className="text-xl">{isFarsi?'خلاصه صورت حساب':'Checkout detail'}</h1>
                    <table className="table items-center  justify-between text-right text-sm text-base-100 gap-4">
                        <thead className="text-base-100">     
                          <tr>
                            <td>{t('قیمت', 'Price')}</td>
                            <td>{t('تعداد', 'Quantity')}</td>
                            <td>{isFarsi?'محصول':'product'}</td>
                          </tr>
                          {cookies.getAll().cartData?cookies.getAll().cartData.map(
                            (product)=>( 
                              <tr>
                                <td>{Number((product.price) * 1000).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')} {t('تومان', 'toman')}</td>
                                <td>{product.quantity}x</td>
                                <td className="flex flex-col">
                                  <span>
                                     {product.productId}# {product.title}
                                  </span>
                                  <span className="text-xs text-neutral">
                                    {t('سایز', 'Size')}: {product.size}

                                  </span>
                                  </td>
                              </tr>

                            )
                          ):'none'}
                    </thead>
                    <tbody>
                          <tr>
                            <td>{Number((calculateTotalPrice()) * 1000).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')} {t('تومان', 'toman')}</td>
                            <td></td>
                            <td>{isFarsi?'مبلغ کل':'final price'}</td>
                          </tr>
                          <tr>
                            <td>{t('رایگان', 'Free')}</td>
                            <td></td>
                            <td>{isFarsi?'هزینه ارسال':'delivery cost'}</td>
                          </tr>
                          <tr>
                            <td>{Number((calall()) * 1000).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')} {t('تومان', 'toman')}</td>
                            <td></td>
                            <td>{t('مبلغ قابل پرداخت', 'Total due')}</td>
                          </tr>
                      </tbody>
                    </table>
                    <button 
                        type="submit"
                        onClick={(e) => handleSubmit(e)}
                        className={`btn  hover:border-2 hover:border-accent rounded-sm m-6 bg-accent hover:bg-base-100 hover:text-accent text-base-100 ${isSubmitDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={isSubmitDisabled || isdataCorr}
    >{t('ثبت سفارش پرداخت نشده', 'Place unpaid order')}</button>
                  </div>
                    
                </div>
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
}




export default Checkout
