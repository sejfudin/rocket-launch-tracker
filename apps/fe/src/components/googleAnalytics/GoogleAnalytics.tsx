import { AppConfig } from "@/config/app.config";

const GoogleAnalytics = () => {
  const { measurementId } = AppConfig.googleAnalytics;

  if (!measurementId) {
    return null;
  }

  return (
    <>
      <script
        id="google-analytics-setup-source"
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />

      <script
        id="google-analytics-set-gtag"
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${measurementId}');
        `,
        }}
      />
    </>
  );
};

export default GoogleAnalytics;
