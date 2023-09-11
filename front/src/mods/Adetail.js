import { useEffect, useState } from "react";
import Cookies from "universal-cookie";


const Adetail = () => {
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
          setData(data)
        } catch (error) {
          console.error('Error fetching products:', error);
        }
    };
    fetchProducts()
},[])
console.log(Data)


    return(
    <div className={` overflow-x-auto ${isFarsi?'font-yek':' font-mont font-thin '}`}>
      <div className="sm:border-2 sm:border-neutral  flex flex-col items-center justify-center">
        <h1 className="font-bold m-5 text-xl ">{isFarsi?'اطلاعات حساب':'Account information'}</h1>
    <table className="table text-accent ">
      {/* head */}
      <tbody>
        {/* row 1 */}
        <tr className="bg-neutral bg-opacity-40 "  >
          <td>
            <div className="flex items-center space-x-3">
              <div>
                <div className="">{isFarsi? Data ? `${Data.fname} ${Data.lname}` : '--':'Name'}</div>
              </div>
            </div>
          </td>
          <td>
          {!isFarsi? Data? `${Data.fname} ${Data.lname}` : '--':'نام'}
          </td>
        </tr>
        {/* row 2 */}
        <tr className=""  >
          <td>
            <div className="flex items-center space-x-3">
              <div>
                <div className="">{isFarsi? Data && Data!==0 ? Data.email : '--':'email'}</div>
              </div>
            </div>
          </td>
          <td>
          {!isFarsi? Data && Data!==0 ? Data.email : '--':'ایمیل'}
          </td>
        </tr>
        {/* row 3 */}
        <tr className="bg-neutral bg-opacity-40"  >
          <td>
            <div className="flex items-center space-x-3">
              <div>
                <div className="">{isFarsi? Data ? Data.PhoneNum : "--" :'Phone number'}</div>
              </div>
            </div>
          </td>
          <td>
          {!isFarsi? Data ? Data.PhoneNum : "--" :'شماره همراه'}
          </td>
        </tr>
      </tbody>
      
    </table>
{/* Open the modal using ID.showModal() method */}

  </div>
  </div>
  )}

export default Adetail;