import { useContext, useEffect, useState } from "react";
import Cookies from "universal-cookie";
import { ThemeContext } from "./themeprovider";
const cookies = new Cookies();
const token = cookies.getAll().token;




const Address = () => {
  const isFarsi = new Cookies().get('Lang') !== 'en';
  const theme = useContext(ThemeContext);
  const [inverted,setin] = useState()
  useEffect(()=>{setin(theme == "benidark" ? " " : "invert" )},[theme])
  const [addresses, setAddresses] = useState([]);

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

    loadAddress(token);
  }, []);

  return (
    <div className={`flex flex-col justify-center ${isFarsi?'font-yek':' font-mont font-thin '}`}>
            <div className="grid sm:grid-cols-2 grid-cols-1 p-5 gap-4">
                {addresses.map((address) => (
                <div key={address.id}> 
                  <Addd data={address}/>
                </div>          
                ))}
                
            <div className="flex  justify-center items-center bg-secondary w-full p-3">
              <a href="/dashboard/address/add/" className=" border-2 border-neutral w-full p-6 flex flex-row justify-center items-center  ">
                <span className="w-1/2 text-xl text-center">{isFarsi?'اضافه کردن':'ADD'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={"w-fit h-20 "+inverted} viewBox="0 0 24 24"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z" fill="rgba(255,255,255,1)"></path></svg>
              </a>
            </div>
          </div>
          </div>
        );
      };

      
      const Addd = (props) => {
        const isFarsi = new Cookies().get('Lang') !== 'en';
        const theme = useContext(ThemeContext);
        const [inverted,setin] = useState()
        useEffect(()=>{setin(theme == "benidark" ? " " : "invert" )},[theme])
        const { data } = props;
        const [loading,setLoading] = useState('opacity-0')
        const handleDelete = async () => {
          try {
            const response = await fetch(`http://127.0.0.1:2000/auth/delete_address/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token: token, AddressID: data.id }),
            });
      
            setLoading('')
            setTimeout(() => {
              // Redirect to another page using the history object
              window.location.href = '/dashboard/address/';
            }, 1000); // Delay in milliseconds (1 second)
          } catch (error) {
            console.error('Error fetching:', error);
          }
        };
      
        return (
          <div className="flex items-center bg-secondary w-full p-6">
            <button className="cursor-pointer" onClick={handleDelete}>
              <svg xmlns="http://www.w3.org/2000/svg" className={"w-10 "+inverted} viewBox="0 0 24 24">
                <path
                  d="M12.0007 10.5865L16.9504 5.63672L18.3646 7.05093L13.4149 12.0007L18.3646 16.9504L16.9504 18.3646L12.0007 13.4149L7.05093 18.3646L5.63672 16.9504L10.5865 12.0007L5.63672 7.05093L7.05093 5.63672L12.0007 10.5865Z"
                  fill="rgba(255,255,255,1)"
                ></path>
              </svg>
            </button>
            <a href={`/dashboard/address/edit/${data.id}`}
            className="btn sm:w-1/4 hover:border-2 hover:border-accent rounded-sm m-6 bg-accent hover:bg-base-100 hover:text-accent text-base-100" 
              >{isFarsi?'ویرایش':'edit'}
            </a>
            <span className={"loading loading-spinner loading-lg "+loading}></span>
            <div className="flex-col flex w-fit h-full p-4 justify-end items-end text-right">
              <h1 className="sm:text-2xl text-sm">{`${data.fname} ${data.lname}`}</h1>
              <span className="text-xs sm:text-sm font-extralight">{`${data.state} , ${data.city}`}</span>
            </div>
          </div>
        );
      };
      

      

export default Address;
