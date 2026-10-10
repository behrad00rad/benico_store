import ItemPage from "./mods/item";
import {useLayoutEffect} from 'react';
import Footer from './mods/Footer';
import Product from "./mods/product";
import {
  Routes,
  BrowserRouter as Router,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";
import Main from "./mods/main";
import Nav from "./mods/nav";
import Cookies from "universal-cookie";
import { ThemeProvider } from "./mods/themeprovider";
import Accounts from "./mods/accounts";
import Dashboard from "./mods/dashbord";
import Checkout from "./mods/Checkout";
import AddAddress from "./mods/CustomerAddressEditor";
import Cart from "./mods/Cart";
import IAddressForm from "./mods/CustomerAddressEditor";
import PasswordReset from "./mods/PasswordReset";
import Search from "./mods/search"; 
import Recipte from "./mods/recipte";
import AboutUs from "./mods/verify";
import {LanguageProvider, useLanguage} from './language';
import AdminPanel from './mods/AdminPanel';

function RouteScrollReset() {
  const {pathname} = useLocation();
  useLayoutEffect(()=>{
    if (window.location.hash) return;
    document.documentElement.scrollTop=0;
    document.body.scrollTop=0;
  },[pathname]);
  return null;
}


function AppContent() {
  const {lang} = useLanguage();
  const cookies = new Cookies();
  const token = cookies.getAll().token ;
  const userinfo = cookies.getAll().userinfo ;

  const theme = 'benilight';
  const cartData = cookies.getAll().cartData;
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

    } catch (error) {
      console.error('Error fetching :', error);
    }
  }
  
  if(token && !userinfo){
      loaduser(token)
    }  

  return (
    <ThemeProvider theme={theme}>
    <div className="site-root" data-theme={theme} lang={lang} dir={lang === 'fa' ? 'rtl' : 'ltr'}>
      <Router>
        <RouteScrollReset/>
        <Routes>
        <Route path="/dashboad/*" element={<Navigate to="/dashboard/detail/" replace/>}/>
        <Route path="/admin/" element={<AdminPanel/>}/>
        <Route path="/checkout/" element={
            <div className="commerce-route">
              <Nav /> 
            <Checkout/>
            </div>
          }/>
        <Route path="/cart/" element={
            <div className="commerce-route">
              <Nav /> 
            <Cart/>
            </div>
          }/>
        <Route path="/dashboard/address/add/" element={
        <div className="commerce-route">
          <Nav /> 
          <AddAddress/>
        </div>
        }/>
        <Route path="/dashboard/address/edit/:id" element={
        <div className="commerce-route">
          <Nav /> 
          <IAddressForm/>
        </div>
        }/>
        <Route path="/products/:category?/:Index?" element={
                <div className=" app-shell ">
              <Nav /> 
              <Product/>
                </div>
                } 
             />
        <Route path="/item/:id" element={
              <div className="product-route">
              <Nav />
              <ItemPage />
              </div>} 
               />
        <Route path="/" element={
          <Main/>
          }/>
        <Route path="/reset-password" element={
          <div className=" app-shell ">
          <Nav/>
          <PasswordReset/>
        </div>
        } />
        <Route path="/accounts" element={
          <div className=" app-shell ">
            <Nav/>
            {!userinfo ?<Accounts/> : <Navigate to={userinfo?.[0]?.is_staff ? '/admin/' : '/dashboard/detail/'} replace />}
            </div>}/>
        <Route path="/dashboard/:Page?" element={
          <div className="commerce-route">
            <Nav/>
            {token ?<Dashboard/> : <Navigate to="/accounts" replace />}
            </div>}/>
        <Route path="/search" element={<><Nav/><Search/></>} />  
        <Route path="/recipte/:id" element={<div className="commerce-route"><Nav/><Recipte/><Footer/></div>} />
        <Route path="/contact-us/" element={<><Nav/><AboutUs/></>} />  


        </Routes>
      </Router>
    </div>
    </ThemeProvider>
  );
}

function LocalizedApp() {
  const {lang} = useLanguage();
  return <AppContent key={lang}/>;
}
export default function App() {
  return <LanguageProvider><LocalizedApp/></LanguageProvider>;
}
