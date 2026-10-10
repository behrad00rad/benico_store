import {useLanguage} from '../language';
const AboutUs = () =>{
  const {t} = useLanguage();
    return (
        <div className="bg-base-100 min-h-screen flex flex-col font-yek justify-center items-center">
          <div className=" bg-secondary p-8 rounded-lg shadow-xl text-right">
            <h1 className="text-2xl font-semibold mb-4">{t('تماس با ما', 'Contact us')}</h1>
            <p className="text-neutral mb-4">
              : از طریق روش‌های زیر می‌توانید با ما در ارتباط باشید
            </p>
            <div className="text-center flex flex-col text-accent gap-7">
              <a
                href="mailto:benico.clothing@gmail.com"
                className="w-full p-4 bg-base-100 hover:underline"
              >
                  ایمیل :  benico.clothing@gmail.com
              </a>
              <a
                href="https://www.instagram.com/benico.clothing/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-4 bg-purple-600 hover:underline"
              >
                اینستاگرام: @benico.clothing
              </a>
              <a
                href="https://t.me/benico_clothing"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-4 bg-blue-700 hover:underline"
              >
                تلگرام: @benico_clothing
              </a>
            </div>
          </div>
        </div>
      );
    };
export default AboutUs