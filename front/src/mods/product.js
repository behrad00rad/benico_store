import React, { useEffect, useState ,useRef, useContext} from 'react';
import Prod from './prods';
import {useLanguage} from '../language';
import Cookies from 'universal-cookie';
import { useParams } from 'react-router-dom';
import { ThemeContext } from './themeprovider';

const MAINURL = 'http://127.0.0.1:2000';

const Product = () => {
  const {t} = useLanguage();
  const [{Index},setIndex] = useState(useParams()) 
  const theme = useContext(ThemeContext);
  const [Data, setData] = useState([]);
  const { category } = useParams();
  const [products,setProducts]=useState([])
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [category]); // Add 'category' as a dependency

  const fetchProducts = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (Index==undefined&&category){
        window.location.href=`/products/${category}/1`
      }
      let response;
      if (!category) {
        response = await fetch(`${MAINURL}/product/all/`);
      } else {
        response = await fetch(`${MAINURL}/product/category/${category}/${Index}`);
      }

      const data = await response.json();

      setProducts(data.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const renderProducts = async () => {
      if (products.length > 0 && Array.isArray(products)) {
        const newComponents = products.map((product) => (
          <Prod key={product.id} prod={product} />
        ));
        setData(newComponents);
      } else {
        setData([]);
      }
    };
    renderProducts();
  }, [products]);


  return (
    <div className="p-3 bg-base-100 text-accent min-h-screen" data-theme={theme}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 p-4">
        {Data.length > 0 ? Data : !isLoading && t('محصولی یافت نشد.', 'No products found.')}
      </div>
      {isLoading && (
        <div className="flex justify-center items-center w-full h-full">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}  
    </div>
  );
};


export default Product;
