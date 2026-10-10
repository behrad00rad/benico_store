import {useLanguage} from '../language';
import { useEffect, useState } from "react";
import Cookies from "universal-cookie";


const Adetail = () => {
  const {t} = useLanguage();
    const cookies = new Cookies()
    const isFarsi = cookies.getAll().Lang === 'fa';
    const [Data,setData] = useState()
    useEffect(()=>{

        const fetchProducts = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:2000/auth/get_detail/`,{
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({token:cookies.getAll().token}),
            });
          const data = await response.json();  
          console.log(data) 
          setData(data)
        } catch (error) {
          console.error('Error fetching products:', error);
        }
    };
    fetchProducts()
},[])



    return(
    <div className={` overflow-x-auto ${isFarsi?'font-yek':' font-mont font-thin '}`}>
      <div className=" flex flex-col items-center justify-center">
        <h1 className="font-bold m-5 text-xl ">{isFarsi?'اطلاعات حساب':'Account information'}</h1>
    <table className="table text-accent text-end ">
      {/* head */}
      <tbody className="bg-secondary">
        <tr>
          <td>{Data?`${Data.fname}  ${Data.lname} `:"--"}</td>
          <td>{t('نام و نام خانوادگی', 'Full name')}</td>
        </tr>
        <tr>
          <td>{Data?`${Data.PhoneNum}`:"--"}</td>
          <td>{t('شماره تلفن', 'Phone number')}</td>
        </tr>
      </tbody>
      
    </table>
{/* Open the modal using ID.showModal() method */}

  </div>
  </div>
  )}

export default Adetail;