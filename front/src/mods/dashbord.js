import React, { useState, useEffect, useContext } from 'react';
import DashNav from './dashnav';
import { useParams } from 'react-router-dom';
import Address from './Address';
import Adetail from './Adetail';
import Orders from './orders';
import Footer from './Footer';
import { ThemeContext } from './themeprovider';

const Dashboard = () => {
  const theme = useContext(ThemeContext);
  const [PageShow, setPG] = useState(null);
  const { Page } = useParams();

  useEffect(() => {
    if (Page === "address") {
      setPG(<Address />);
    }
    else if (Page === "detail" || !Page) {      
      setPG(<Adetail />);
    }
    else if (Page === "orders") {
      setPG(<Orders />);

    }      
  }, [Page]);

  return (
    <>
    <div className='min-w-screen flex flex-col lg:flex-row min-h-screen h-fit sm:p-6 py-4 gap-4' data-theme={theme}>
      <div className='bg-base-100 lg:w-4/5 h-fit'>
        {PageShow ? PageShow : "not found" }
      </div>
      <DashNav/>
    </div>
      <Footer/>
    </>
  );
};

export default Dashboard;
