import { useContext, useEffect, useRef, useState } from "react";
import Cookies from "universal-cookie";
import { ThemeContext } from "./themeprovider";


const Accounts = () => {
    
    const [timerStarted, setTimerStarted] = useState(false); 
    const [added, setAdded] = useState('translate-y-full opacity-0');
    const [status,setStatus] = useState([' alert-error ','login failed',false]);
    const theme = useContext(ThemeContext);
    const cookies = new Cookies();
    const isFarsi = cookies.getAll().Lang === 'fa';
    const [email,setemail] = useState('');
    const [semail,setsemail] = useState('');
    const [password,setPassword] = useState('');
    const [spassword,setsPassword] = useState('');
    const [sspassword,setssPassword] = useState('');
    const [susername,setsusername] = useState('');
    const Reg = useRef(null);
    const Log = useRef(null);
    const scrollToReg = () => {
        Reg?.current?.scrollIntoView({ behavior : 'smooth' });
      };
    const scrollToLog = () => {
        Log?.current?.scrollIntoView({ behavior : 'smooth' });
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

    const userLoginData = {
        email:email,
        password:password
    }
    const userRegisterData = {
        username:susername,
        email:semail,
        password:spassword
    }
    const handleLogin = async() =>{
        try {
            const response = await fetch(`http://127.0.0.1:2000/auth/login/`,{
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(userLoginData),
            });
            const data = await response.json();
            if (response.status === 401){     
                setStatus([' alert-error ',data.error,false])
                setAdded('translate-y-0 opacity-1')
                setTimerStarted(true)
            }
            else if(response.status === 200){
                setStatus(['alert-success',isFarsi?'ورود موفقیت امیز':'login successful',true])
                setAdded('translate-y-0 opacity-1')
                setTimerStarted(true)
                cookies.set('token', data.token, { path: '/' })
                setTimeout(() => {
                    // Redirect to another page using the history object
                    window.location.href = '/products/';
                  }, 2000); // Delay in milliseconds (2 seconds)
                
            }
            
        } catch (error) {
            console.error('Error fetching :', error);
            setStatus(['error','login failed',true])
            setAdded('otranslate-y-0 opacity-1')
            setTimerStarted(true)
          }
    }
    const handleRegister = async() =>{
        if (spassword===sspassword){

            try {
                
            const response = await fetch(`http://127.0.0.1:2000/auth/register/`,{
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(userRegisterData),
            });
            if (response.status === 409){     
                setStatus(['alert-error',isFarsi?'نام کاربری موجود نیست':'username already exist',false])
                setAdded('translate-y-0 opacity-1')
                setTimerStarted(true)
            }
            else if(response.status === 201){
                const data = await response.json();
                setStatus(['alert-success',isFarsi?'ثبت نام موفقیت امیز':'register successful',true])
                setAdded('translate-y-0 opacity-1')
                setTimerStarted(true)
                cookies.set('token', data.token, { path: '/' })
                setTimeout(() => {
                    // Redirect to another page using the history object
                    window.location.href = '/products/';
                  }, 2000); // Delay in milliseconds (2 seconds)
                
            }
            
        } catch (error) {
            setStatus(['alert-error','error has accured',false])
            setAdded('translate-y-0 opacity-1')
            setTimerStarted(true)
            console.error('Error fetching products:', error);
          }
        }
        else if (sspassword !== spassword){
            setStatus(['alert-error',isFarsi?'رمزعبور ها یکی نیستند':"passwords don't match",false])
            setAdded(' translate-y-0 opacity-1')
            setTimerStarted(true)
        }

    }
    return(
    <div className="flex flex-col md:flex-row bg-base-100" data-theme={theme}>
        <div ref={Log}  className={`px-10 sm:w-1/2 min-h-screen  items-center justify-center flex flex-col ${isFarsi?'font-yek':' font-mont font-thin '}`}>
            <div className="w-full h-fit  p-3 flex flex-col gap-5 justify-center">
                <h1 className="  text-3xl mb-10 text-center text-accent">{isFarsi?'ورود به حساب کاربری':'Login to Your account'}</h1>
                <input 
                    name="email"
                    value={email}
                    type="text"
                    autoComplete="email"
                    placeholder={isFarsi?'ادرس ایمیل':"Email address"}
                    className="  p-2  bg-base-100 outline-none border-b-2 border-accent text-accent"
                    onChange={(e) => setemail(e.target.value)} 
                    required />
                <input 
                    name="password"
                    value={password}
                    type="text" 
                    autoComplete="password" 
                    placeholder={isFarsi?'رمز عبور':"password"} 
                    className="  p-2  bg-base-100 outline-none border-b-2 border-accent text-accent"
                    onChange={(e) => setPassword(e.target.value)} 
                    required />

                <a className="w-1/2 text-xs cursor-pointer ">
                    <span className="underline   text-accent">{isFarsi?'فراموشی رمز عبور':"ّForgot your password?"} </span>    
                </a>    
                <a className="w-1/2 text-xs cursor-pointer sm:hidden"  onClick={scrollToReg}>
                    <span className="underline   text-accent">{isFarsi?'حساب کاربری ندارید؟ساخت حساب':"don't have an account?"}</span>    
                </a>    

                <button 
                    type="submit"  
                    className="p-2  bg-accent text-base-100"
                    required
                    onClick={handleLogin} 
                    >
                                <span>Login</span>        
                </button>

            </div>
        </div>
        <div className="divider divider-vertical sm:divider-horizontal sm:my-10 mx-5"></div>
        <div className="sm:w-1/2 min-h-screen items-center justify-center flex">
            <div className="w-full h-fit  p-3 flex flex-col gap-3 justify-center">
                <h1 ref={Reg} className="text-3xl text-accent text-center   mb-10">{isFarsi?'ساخت حساب کاربری':'Register'}</h1>
                <input 
                    name="email"
                    value={semail}
                    type="text"
                    autoComplete="email"
                    placeholder={isFarsi?'ادرس ایمیل':"Email address"} 
                    className="  p-2  bg-base-100 outline-none border-b-2 border-accent text-accent"
                    onChange={(e) => setsemail(e.target.value)} 
                    required />
                <input 
                    name="username"
                    value={susername}
                    type="text"
                    autoComplete="username"
                    placeholder={isFarsi?'نام کاربری':"username"} 
                    className="  p-2  bg-base-100 outline-none border-b-2 border-accent text-accent"
                    onChange={(e) => setsusername(e.target.value)} 
                    required />
                <input 
                    name="password"
                    value={spassword}
                    type="text"
                    autoComplete="password"
                    placeholder={isFarsi?'رمز عبور':"password"} 
                    className="  p-2  bg-base-100 outline-none border-b-2 border-accent text-accent"
                    onChange={(e) => setsPassword(e.target.value)} 
                    required />
                <input 
                    name="sec-password"
                    value={sspassword}
                    type="text"
                    autoComplete="password"
                    placeholder={isFarsi?'تکرار رمز عبور':"password again"} 
                    className="  p-2  bg-base-100 outline-none border-b-2 border-accent text-accent"
                    onChange={(e) => setssPassword(e.target.value)} 
                    required />
               <button 
                    type="submit"  
                    className="p-2  bg-accent text-base-100"
                    required
                    onClick={handleRegister} 
                    >            
                        <span>
                        {isFarsi?'ثبت نام':"Register"} 
                        </span>        
                </button>  
                <a className="w-1/2 text-xs cursor-pointer"  onClick={scrollToLog}>
                    <span className="sm:hidden underline   text-accent">{isFarsi?'حساب کاربری دارید؟ورود کنید':"already have an account?"} </span>    
                </a>    
          
            </div>
        </div>
       <div className={`alert transform ${status[0]} ease-in transition-transform duration-300 bottom-0 my-10 left-0 right-0 fixed ${added}`}>
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
export default Accounts 