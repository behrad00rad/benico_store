import { useContext } from 'react';
import ImageSlider from './imageslider';
import { ThemeContext } from './themeprovider';
import Cookies from 'universal-cookie';

const Prod = ( prod ) => {
  const cookies = new Cookies();
const theme = useContext(ThemeContext);
const isFarsi = cookies.getAll().Lang === 'fa';
  return (
    <div
      data-theme={theme}
      key={prod.prod.id}
      className={" card card-compact bg-base-100 rounded-sm "+isFarsi?' font-yek ':' font-mont '}
    >
      <figure>
        <ImageSlider uuids={prod.prod.images} id={prod.prod.id} />
      </figure>
      <a href={`/item/${prod.prod.id}` } className='cursor-default'>

      <div className=" cursor-pointer py-6 px-0 gap-y-3 ">
        <h2 className="card-title text-accent">
          <span>{prod.prod.title}</span><span className='text-info'>#{prod.prod.id}</span>
        </h2>
        {/* <span>Price :</span> */}
        <div className=" flex w-full justify-between items-center ">
            <span className='font-mont rounded w-1/2 font-light'>{prod.prod.price},000 {isFarsi?"تومان":'Tm'}</span>
             <a href={`/item/${prod.prod.id}` }  className="btn rounded-sm text-accent border-2 border-neutral btn-primary hover:border-none hover:bg-green-700 w-1/2" >
                   {isFarsi?'خرید':'Buy Now'}
            </a>
        </div>
      </div>
      </a>
    </div>
  );
};

export default Prod;
