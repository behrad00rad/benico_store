import {useLanguage} from '../language';
import React, { useState } from "react";


const PasswordReset = () => {
  const {t} = useLanguage();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(["","red"]);
  const [error, setError] = useState("");

  const handleReset = async () => {
    try {
      const response = await fetch("http://127.0.0.1:2000/auth/reset-password/", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({email:email}),
      });
      const data = await response.json();

      setMessage([data.message,response.status==200?" text-green-500 ":"text-red-500 "]);
      setError("");
    } catch (err) {
      setError("مشکلی پیش امد. لطفا مجدد تلاش کنید");
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen flex items-center font-yek justify-center bg-base-100">
      <div className="max-w-md w-full p-6 space-y-6">
        <h2 className="text-3xl text-center font-bold">{t('بازیابی رمزعبور', 'Reset password')}</h2>
        {message && (
          <div className={" text-center "+message[1]}>{message[0]}</div>
        )}
        {error && (
          <div className="text-red-500 text-center">{error}</div>
        )}
        <div>
          <label className="block text-neutral">{t('ایمیل', 'Email')}</label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            className="mt-1 p-2 w-full border rounded-sm bg-accent text-base-100"
            placeholder="ادرس ایمیل خود را وارد کنید"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <button
            className="bg-accent btn hover:bg-secondary hover:text-accent text-base-100 py-2 px-4 rounded-sm"
            onClick={handleReset}
          >
            ارسال کد بازیابی
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
