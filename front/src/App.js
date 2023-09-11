import ItemPage from "./mods/item";
import Product from "./mods/product";
import {
  Routes,
  BrowserRouter as Router,
  Route,
  Navigate,
  redirect
} from "react-router-dom";
import Main from "./mods/main";
import Nav from "./mods/nav";
import Cookies from "universal-cookie";
import { useState,useEffect } from "react";
import { ThemeProvider } from "./mods/themeprovider";
import Accounts from "./mods/accounts";
import Dashboard from "./mods/dashbord";
import Checkout from "./mods/Checkout";
import AddAddress from "./mods/AddAddress";
import Cart from "./mods/Cart";
import IAddressForm from "./mods/forom";
import Admin from "./mods/Admin";

function App() {
  const cookies = new Cookies();
  cookies.set('Lang', 'fa',{ path: '/' });
  const token = cookies.getAll().token ;
  const userinfo = cookies.getAll().userinfo ;

  const prefersDarkMode = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
  const cartData = cookies.getAll().cartData;
  const [theme, setTheme] = useState(prefersDarkMode() ? 'benidark' : 'benilight');
  if (!cartData || cartData.length === 0) {
    cookies.set('cartData', [], { path: '/' });
  }
  const loaduser = async(token) =>{
    try {
      const response = await fetch(`http://127.0.0.1:2000/auth/get_info/`,{
          method: 'POST', 
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({token:token}),
      });
      const data = await response.json();
      cookies.set('userinfo',data,{ path : '/' })
      console.log(data)
    } catch (error) {
      console.error('Error fetching :', error);
    }
  }
  
  if(token && !userinfo){
      loaduser(token)
    }  

  const handleLangSelect = (lang) => {
    cookies.set('Lang', lang,{ path: '/' });
    window.location.reload(); // Reload the page to apply the selected language
  };
  useEffect(() => {
    // Add an event listener to detect changes in the user's preferenc

    const handleThemeChange = (e) => {
      setTheme(e.matches ? 'benidark' : 'benilight');
    };
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addListener(handleThemeChange);
    return () => darkModeMediaQuery.removeListener(handleThemeChange);
  }, []);
  return (
    <ThemeProvider theme={theme}>
    <div  >
      <Router>
        <Routes>
          <Route path="/checkout/" element={
            <div className=" 2xl:px-96 2xl:py-52 ">
              <Nav /> 
            <Checkout/>
            </div>
          }/>
          <Route path="/cart/" element={
            <div className=" 2xl:px-96 2xl:py-52 ">
              <Nav /> 
            <Cart/>
            </div>
          }/>
        <Route path="/dashboard/address/add/" element={
        <div className=" 2xl:px-96 2xl:py-52 ">
          <Nav /> 
          <AddAddress/>
        </div>
        }/>
        <Route path="/dashboard/address/edit/:id" element={
        <div className=" 2xl:px-96 2xl:py-52 ">
          <Nav /> 
          <IAddressForm/>
        </div>
        }/>
          <Route path="/products/:category?/:Index?" element={
                <div className=" 2xl:px-96 2xl:py-52 ">
              <Nav /> 
              <Product/>
                </div>
                } 
             />
          <Route path="/item/:id" element={
              <div className=" 2xl:px-96 2xl:py-52 ">
              <Nav />
              <ItemPage />
              </div>} 
               />
          <Route path="/" element={
          <Main/>
          }/>

          <Route path="/accounts" element={
          <div className=" 2xl:px-96 2xl:py-52 ">
            <Nav/>
            {!userinfo ?<Accounts/> : <Navigate to="/dashboard" replace />}
            </div>}/>
          <Route path="/dashboard/:Page?" element={
          <div className=" 2xl:px-96 2xl:py-52 ">
            <Nav/>
            {userinfo ?<Dashboard/> : <Navigate to="/accounts" replace />}
            </div>}/>

        </Routes>
      </Router>
    </div>
    </ThemeProvider>
  );
}

export default App;
