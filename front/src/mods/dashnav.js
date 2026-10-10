import { useParams } from "react-router-dom";
import Cookies from "universal-cookie";

const DashNav = () =>{
  const { Page } = useParams();
  const cookies = new Cookies()
  const isFarsi = cookies.getAll().Lang === 'fa';
  
    return(
        <div className={` bg-secondary h-fit lg:h-fit font-mont text-accent lg:w-1/3  gap-2 justify-start flex-col flex ${isFarsi?'font-yek':' font-mont font-thin '}`}>
        <ul>
            {cookies.get('userinfo')?.[0]?.is_staff && <a href="/admin/"><li className="p-5 bg-accent text-base-100">{isFarsi ? 'مدیریت فروشگاه · محصولات و سفارش‌ها' : 'Manage store · Products & orders'} ↗</li></a>}
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
            <button type="button" className="p-5 text-start w-full" onClick={() => {cookies.remove('token', {path:'/'}); cookies.remove('userinfo', {path:'/'}); window.location.href='/accounts/';}}>{isFarsi ? 'خروج از حساب' : 'Sign out'}</button>
       </ul>
    </div>
    );
}
export default DashNav
