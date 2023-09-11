import { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import jalaliMoment from 'jalali-moment';
 
const Orders =() => { 
    const convertToShamsi = (isoDate) => {
        const date = new Date(isoDate);
        const jalaliDate = jalaliMoment(date);
    
        // Convert jalaliDate to string in the desired format
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const shamsiDateString = jalaliDate.locale('fa').format('YYYY-MM-DD');
        const intlFormatted = new Intl.DateTimeFormat('fa-IR', options).format(date);
    
        return intlFormatted; // or shamsiDateString
      };
    
    

    const cookies = new Cookies() 
    const token = cookies.getAll().token 
    const [orders,setOrders] = useState([])
    useEffect(() => {
        const loadOrders = async (token) => {
          try { 
            const response = await fetch(`http://127.0.0.1:2000/auth/get_order/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },  
              body: JSON.stringify({ token: token }),
            });
            const data = await response.json();
            console.log(data)
            setOrders((oldData) => [...oldData, ...data.orders]);
          } catch (error) {
            console.error('Error fetching:', error);
          }
        };
    
        loadOrders(token);
      }, []); 
 
    return(
    <div className="overflow-y-scroll  h-full scroll-smooth"> 
                {orders.map((order) => (
                <div key={order.id}>                
                    <div className="collapse collapse-arrow bg-secondary rounded-sm mb-4">
                        <input type="checkbox" name="my-accordion-2" />  
                        <div className="collapse-title text-xl font-medium"> 
                            {`${convertToShamsi(order.date)} ${order.products}`}
                        </div>  
                        <div className="collapse-content"> 
                        <table className="table flex p-2">
                            <tbody>
                                <tr key={order.order_id}>
                                    <td>date</td>
                                    <td>{convertToShamsi(order.date)}</td>
                                </tr>
                                <tr>

                                    <td>products</td> 
                                    <td>{order.products.join(', ')}</td> 
                                </tr>
                                <tr>
                                    <td>price</td>
                                    <td>{order.price}</td>
                                </tr>
                                <tr>
                                    <td>Address</td>
                                    <td>{order.address}</td>
                                </tr>
                                {/* Add more table cells based on the headers */}
                            </tbody>
                        </table>
                        </div> 
                    </div>                    
                </div> 
                ))} 
    </div>)    
} 
export default Orders