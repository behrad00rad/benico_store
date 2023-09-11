import { useParams } from "react-router-dom";
import Cookies from "universal-cookie";

const DashNav = () =>{
  const { Page } = useParams();
  const cookies = new Cookies()
  const isFarsi = cookies.getAll().Lang === 'fa';
  
    return(
        <div className={` bg-secondary h-fit sm:h-fit font-mont text-accent sm:w-1/3  gap-2 justify-start flex-col flex ${isFarsi?'font-yek':' font-mont font-thin '}`}>
        <ul>
             <a href="/dashboard/detail/">
          <li className={` select-none cursor-pointer border-y border-base-100 p-5 ${Page === 'detail' ? " bg-neutral bg-opacity-40 text-accent":""}`}>
                <span>
                {isFarsi?'اطلاعات حساب':'Account detail'}
                </span>
            </li>
             </a>
            <a href="/dashboard/address/">
          <li className={` select-none cursor-pointer border-y border-base-100 p-5 ${Page === 'address' ? " bg-neutral bg-opacity-40 text-accent":""}`}>
            <span>
            {isFarsi?'آدرس های شما':'Addresses'}
            </span>
          </li>
            </a>
            <a href="/dashboard/orders/">
          <li className={` select-none cursor-pointer border-y border-base-100 p-5  ${Page === 'orders' ? " bg-neutral bg-opacity-40 text-accent ":""}`}>
                <span>
                {isFarsi?'سفارش های شما':'Your Orders'}
                </span>
          </li>
            </a>
       </ul>
    </div>
    );
}
export default DashNav