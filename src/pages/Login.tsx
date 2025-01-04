import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useSessionContext } from "@supabase/auth-helpers-react";

const Login = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useSessionContext();

  useEffect(() => {
    if (session) {
      navigate("/");
    }
  }, [session, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary border-r-2"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fadeIn">
        <div className="glass-morphism rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              Welcome to Universal KYC
            </h2>
            <p className="mt-3 text-sm text-foreground/80">
              Sign in or create an account to continue
            </p>
          </div>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(199, 89%, 49%)',
                    brandAccent: 'hsl(199, 89%, 40%)',
                    brandButtonText: 'white',
                    defaultButtonBackground: 'hsl(217.2, 32.6%, 17.5%)',
                    defaultButtonBackgroundHover: 'hsl(217.2, 32.6%, 20.5%)',
                    inputBackground: 'hsl(222, 47%, 11%)',
                    inputBorder: 'hsl(217.2, 32.6%, 17.5%)',
                    inputBorderHover: 'hsl(199, 89%, 49%)',
                    inputBorderFocus: 'hsl(199, 89%, 49%)',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '0.75rem',
                    buttonBorderRadius: '0.75rem',
                    inputBorderRadius: '0.75rem',
                  },
                  space: {
                    inputPadding: '1rem',
                    buttonPadding: '1rem',
                  },
                },
              },
              className: {
                container: 'neo-blur',
                button: 'shadow-lg hover:shadow-xl transition-all duration-200',
                input: 'shadow-inner',
                label: 'text-foreground/80',
              },
            }}
            providers={[]}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;