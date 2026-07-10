import React, { useEffect, useRef, useState } from 'react';

const Captcha = ({ onChange }) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  const turnstileKey = process.env.TURNSTILE_SITE_KEY;
  const hcaptchaKey = process.env.HCAPTCHA_SITE_KEY;
  const isDev = process.env.NODE_ENV !== 'production';

  useEffect(() => {
    if (!turnstileKey && !hcaptchaKey) {
      if (isDev) {
        console.log('Skipping CAPTCHA widget in development (no site keys configured).');
        onChange('mock-token');
      }
      return;
    }

    const loadScript = () => {
      const scriptId = turnstileKey ? 'cloudflare-turnstile-script' : 'hcaptcha-script';
      let script = document.getElementById(scriptId);

      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = turnstileKey 
          ? 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit' 
          : 'https://js.hcaptcha.com/1/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }

      const checkLoaded = () => {
        if (turnstileKey && window.turnstile) {
          setLoaded(true);
        } else if (hcaptchaKey && window.hcaptcha) {
          setLoaded(true);
        } else {
          setTimeout(checkLoaded, 100);
        }
      };

      script.onload = checkLoaded;
      checkLoaded();
    };

    loadScript();

    return () => {
      if (widgetIdRef.current) {
        try {
          if (turnstileKey && window.turnstile) {
            window.turnstile.remove(widgetIdRef.current);
          } else if (hcaptchaKey && window.hcaptcha) {
            window.hcaptcha.reset(widgetIdRef.current);
          }
        } catch (e) {
          console.warn('Captcha widget unmount cleanup failed:', e);
        }
      }
    };
  }, [turnstileKey, hcaptchaKey]);

  useEffect(() => {
    if (!loaded || !containerRef.current) return;

    try {
      if (turnstileKey && window.turnstile) {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: turnstileKey,
          callback: (token) => onChange(token),
          'expired-callback': () => onChange(null),
          'error-callback': () => onChange(null)
        });
      } else if (hcaptchaKey && window.hcaptcha) {
        widgetIdRef.current = window.hcaptcha.render(containerRef.current, {
          sitekey: hcaptchaKey,
          callback: (token) => onChange(token),
          'expired-callback': () => onChange(null),
          'error-callback': () => onChange(null)
        });
      }
    } catch (e) {
      console.error('Failed to render CAPTCHA widget:', e);
    }
  }, [loaded, turnstileKey, hcaptchaKey]);

  if (!turnstileKey && !hcaptchaKey) {
    if (isDev) {
      return (
        <div className="tw-p-3 tw-bg-gray-100 tw-rounded tw-text-xs tw-text-gray-500 tw-text-center tw-mb-4">
          CAPTCHA Widget (Mocked in Dev Mode)
        </div>
      );
    }
    return null;
  }

  return (
    <div className="captcha-container tw-flex tw-justify-center tw-my-4">
      <div ref={containerRef}></div>
    </div>
  );
};

export default Captcha;
