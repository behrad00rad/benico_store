import {useEffect, useState} from 'react';
import Cookies from 'universal-cookie';
import {useLanguage} from '../language';
import campaign from '../assets/campaign.png';
import infinite from '../assets/infinite.jpg';
import './content-editor.css';

export default function ContentEditor({active,onDirtyChange}) {
  const {t, lang} = useLanguage();
  const token = new Cookies().get('token');
  const [saved, setSaved] = useState(null);
  const [draft, setDraft] = useState(null);
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [fields, setFields] = useState({});
  const [previewLang, setPreviewLang] = useState(lang);
  const dirty = draft && JSON.stringify(draft) !== JSON.stringify(saved);
  useEffect(()=>{onDirtyChange?.(!!dirty);},[dirty,onDirtyChange]);
  const call = async (options={}) => {
    const response = await fetch('/auth/manage/content/', {...options, headers:{Authorization:`Token ${token}`, 'Content-Type':'application/json'}});
    const data = await response.json();
    if (!response.ok) {setFields(data.fields || {}); throw new Error(data.error || t('بارگذاری ناموفق بود.', 'Unable to load content.'));}
    return data;
  };
  useEffect(() => {
    if (!active || draft) return;
    const controller = new AbortController();
    call({signal:controller.signal}).then(data=>{setSaved(data.content);setDraft(data.content);setRevision(data.revision);}).catch(e=>{if(e.name!=='AbortError')setNotice(e.message);});
    return ()=>controller.abort();
    // The draft persists when switching admin sections.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, token]);
  useEffect(()=>{
    if (!dirty) return;
    const warn=e=>{e.preventDefault();e.returnValue='';};
    window.addEventListener('beforeunload',warn);
    return()=>window.removeEventListener('beforeunload',warn);
  },[dirty]);
  const update=(section,key,value)=>{setDraft(old=>({...old,[section]:{...old[section],[key]:value}}));setNotice('');setFields({});};
  const save=async event=>{
    event.preventDefault();setBusy(true);setNotice('');setFields({});
    try {const data=await call({method:'PUT',body:JSON.stringify({content:draft,revision})});setSaved(data.content);setDraft(data.content);setRevision(data.revision);setNotice(t('محتوا ذخیره شد و در فروشگاه نمایش داده می‌شود.', 'Content saved and now visible on the storefront.'));}
    catch(e){setNotice(e.message);}finally{setBusy(false);}
  };
  const reload=async()=>{
    setBusy(true);try{const data=await call();setSaved(data.content);setDraft(data.content);setRevision(data.revision);setFields({});setNotice('');}catch(e){setNotice(e.message);}finally{setBusy(false);}
  };
  const upload=async(section,file)=>{
    if(!file)return;setBusy(true);setNotice('');
    try{const body=new FormData();body.append('image',file);const r=await fetch('/auth/manage/content/images/',{method:'POST',headers:{Authorization:`Token ${token}`},body});const data=await r.json();if(!r.ok)throw Error(data.error);update(section,'image',data.url);}
    catch(e){setNotice(e.message);}finally{setBusy(false);}
  };
  const sections={hero:t('تصویر و متن آغازین','Homepage hero'),intro:t('معرفی مجموعه','Collection introduction'),editorial_one:t('کارت مجموعه اول','First editorial card'),editorial_two:t('کارت مجموعه دوم','Second editorial card'),story:t('دنیای بنیکو','Brand story')};
  const labels={eyebrow:t('عنوان کوتاه','Eyebrow'),title_fa:t('عنوان فارسی','Persian title'),title_en:t('عنوان انگلیسی','English title'),text_fa:t('متن فارسی','Persian text'),text_en:t('متن انگلیسی','English text'),button_fa:t('متن دکمه فارسی','Persian button label'),button_en:t('متن دکمه انگلیسی','English button label'),link:t('مسیر دکمه','Button destination'),alt_fa:t('توضیح تصویر فارسی','Persian image description'),alt_en:t('توضیح تصویر انگلیسی','English image description')};
  const fallback=section=>section==='editorial_one'?infinite:campaign;
  return <section className="content-workspace" hidden={!active}>
    <div className="content-heading"><div><h2>{t('محتوای فروشگاه','Storefront content')}</h2><p>{t('تصاویر، متن‌ها و لینک‌های صفحه اصلی را به دو زبان تغییر دهید.', 'Manage homepage images, copy and links in both languages.')}</p></div><a href="/" target="_blank" rel="noreferrer">{t('مشاهده فروشگاه','Open storefront')} ↗</a></div>
    {notice&&<p className="admin-notice" role="status">{notice}</p>}
    {!draft?<div><p role="status">{t('در حال بارگذاری محتوا…','Loading content…')}</p>{notice&&<button onClick={reload}>{t('تلاش مجدد','Try again')}</button>}</div>:<form onSubmit={save}>
      <div className="content-toolbar"><p>{dirty?t('تغییرات ذخیره نشده','Unsaved changes'):t('نسخه ذخیره شده','Saved version')} · {t('نسخه','Revision')} {revision}</p><button type="button" className="admin-secondary" disabled={busy} onClick={reload}>{t('بارگذاری نسخه ذخیره شده','Reload saved version')}</button><button className="admin-primary" disabled={busy||!dirty}>{busy?t('در حال پردازش…','Working…'):t('ذخیره و اعمال در فروشگاه','Save to storefront')}</button></div>
      <div className="content-layout"><div className="content-fields">{Object.entries(sections).map(([section,title])=><details key={section} open={section==='hero'} className="content-section"><summary>{title}<span>＋</span></summary><div>{Object.entries(draft[section]).map(([key,value])=>key==='image'?<div className="content-image-field" key={key}><img src={value||fallback(section)} alt=""/><label>{t('تغییر تصویر','Replace image')}<input disabled={busy} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e=>{upload(section,e.target.files[0]);e.target.value='';}}/></label><small>{t('حداکثر ۱۰ مگابایت؛ تصویر افقی برای بخش آغازین بهتر است.','Up to 10 MB. A landscape image works best for the hero.')}</small>{value&&<button type="button" disabled={busy} onClick={()=>update(section,key,'')}>{t('بازگشت به تصویر پیش‌فرض','Use default image')}</button>}</div>:key==='enabled'?<label className="content-toggle" key={key}><input type="checkbox" checked={value} disabled={busy} onChange={e=>update(section,key,e.target.checked)}/>{t('نمایش این بخش','Show this section')}</label>:key==='position'?<label key={key}>{t('تمرکز تصویر','Image focal point')}<select disabled={busy} value={value} onChange={e=>update(section,key,e.target.value)}><option value="top">{t('بالا','Top')}</option><option value="center">{t('وسط','Center')}</option><option value="bottom">{t('پایین','Bottom')}</option></select></label>:<label key={key}>{labels[key]}{key.startsWith('text')?<textarea rows={3} disabled={busy} maxLength={2000} value={value} dir={key.endsWith('_fa')?'rtl':'ltr'} onChange={e=>update(section,key,e.target.value)}/>:<input disabled={busy} maxLength={2000} value={value} dir={key.endsWith('_fa')?'rtl':'ltr'} onChange={e=>update(section,key,e.target.value)}/ >}{fields[`${section}.${key}`]&&<small role="alert">{fields[`${section}.${key}`]}</small>}{key==='link'&&<small>{t('مثال: /products/hoodie/1/ یا /item/8101/','For example: /products/hoodie/1/ or /item/8101/')}</small>}</label>)}</div></details>)}</div>
      <aside className="content-preview"><header><span>{t('پیش‌نمایش زنده','Live preview')}</span><button type="button" onClick={()=>setPreviewLang(v=>v==='en'?'fa':'en')}>{previewLang==='fa'?'EN':'فارسی'}</button></header><div className="content-preview-hero"><img src={draft.hero.image||campaign} style={{objectPosition:draft.hero.position}} alt=""/><strong>BENICO</strong><div dir={previewLang==='fa'?'rtl':'ltr'}><p>{draft.hero.eyebrow}</p><h3>{draft.hero[`title_${previewLang}`]}</h3><span>{draft.hero[`button_${previewLang}`]}</span></div></div><div className="content-preview-copy" dir={previewLang==='fa'?'rtl':'ltr'}><h3>{draft.intro[`title_${previewLang}`]}</h3><p>{draft.intro[`text_${previewLang}`]}</p></div><div className="content-preview-cards">{['editorial_one','editorial_two'].filter(s=>draft[s].enabled).map(s=><div key={s}><img src={draft[s].image||fallback(s)} alt=""/><h4>{draft[s][`title_${previewLang}`]}</h4></div>)}</div><p className="content-preview-note">{t('ذخیره، تغییرات را برای همه بازدیدکنندگان اعمال می‌کند.', 'Saving applies these changes for all visitors.')}</p></aside></div>
    </form>}
  </section>;
}
