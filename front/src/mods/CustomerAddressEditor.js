import {useEffect,useState} from 'react';
import {Link,Navigate,useNavigate,useParams} from 'react-router-dom';
import Cookies from 'universal-cookie';
import {useLanguage} from '../language';
import {accountRequest,DeliveryFields,emptyDelivery,validateDelivery} from './commerce';
import AccountLayout from './account-layout';

export default function CustomerAddressEditor(){
  const {id}=useParams(),navigate=useNavigate(),{t}=useLanguage();
  const token=new Cookies().get('token');
  const [value,setValue]=useState({...emptyDelivery}),[loading,setLoading]=useState(!!id),[busy,setBusy]=useState(false),[errors,setErrors]=useState({}),[notice,setNotice]=useState('');
  useEffect(()=>{if(!id||!token)return;const c=new AbortController();accountRequest(`addresses/${id}/`,{signal:c.signal}).then(({address:a})=>setValue({fname:a.fname,lname:a.lname,state:a.state,city:a.city,address:a.address,PostalCode:String(a.postal_code).padStart(10,'0'),phoneNumber:String(a.phone_number).padStart(11,'0')})).catch(e=>{if(e.name!=='AbortError')setNotice(e.message);}).finally(()=>{if(!c.signal.aborted)setLoading(false);});return()=>c.abort();},[id,token]);
  const save=async e=>{e.preventDefault();if(busy)return;const problems=validateDelivery(value,t);setErrors(problems);if(Object.keys(problems).length){document.getElementById(`delivery-${Object.keys(problems)[0]}`)?.focus();return;}setBusy(true);setNotice('');try{await accountRequest(id?`addresses/${id}/`:'addresses/',{method:id?'PATCH':'POST',body:JSON.stringify(value)});navigate('/dashboard/address/');}catch(e){setErrors(e.fields||{});setNotice(e.message);}finally{setBusy(false);}};
  if(!token)return <Navigate to="/accounts/" replace/>;
  return <AccountLayout title={id?t('ویرایش نشانی','Edit address'):t('نشانی جدید','Add an address')}><p className="commerce-note">{t('نشانی ذخیره‌شده در مرحله ارسال قابل انتخاب است.','Your saved address will be available at checkout.')}</p>{loading?<p role="status">{t('در حال بارگذاری…','Loading address…')}</p>:<form noValidate onSubmit={save}>{notice&&<p role="alert" className="commerce-error">{notice}</p>}<DeliveryFields value={value} onChange={v=>{setValue(v);setErrors({});}} errors={errors} disabled={busy}/><div className="account-editor-actions"><Link to="/dashboard/address/">{t('انصراف','Cancel')}</Link><button className="commerce-primary" disabled={busy}>{busy?t('در حال ذخیره…','Saving…'):t('ذخیره نشانی','Save address')} ↗</button></div></form>}</AccountLayout>;
}
