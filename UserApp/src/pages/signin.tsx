import Router from 'next/router';
import * as React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import GlobalStyles from '@mui/joy/GlobalStyles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormLabel, { formLabelClasses } from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Typography from '@mui/joy/Typography';
import { useAppContext } from '../context';
import BackRedirect from '../components/common/BackRedirect';
import { useTranslation } from 'next-i18next';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';

interface FormElements extends HTMLFormControlsCollection {
  username: HTMLInputElement;
  password: HTMLInputElement;
  persistent: HTMLInputElement;
}

interface SignInFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

//Citation: https://mui.com/joy-ui/getting-started/templates/sign-in-side/


export const getServerSideProps: GetServerSideProps = async context => {
  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? 'en', ['common'])),
    },
  };
};

export default function Signin() {
  const { signIn, signOut } = useAppContext();
  const { ready, t } = useTranslation('common');

  React.useEffect(() => {
    signOut();
  }, []);

  const handleSubmit = (username: string, password: string) => {
    const query = {
      query: `
        query signin{
          signin(username: "${username}" password: "${password}") { username, accessToken, name }
        }
      `,
    };
    fetch('/api/graphql', {
      method: 'POST',
      body: JSON.stringify(query),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        return res.json();
      })
      .then(json => {
        if (json.errors) {
          alert('Error signing in, please try again');
        } else {
          const user = json.data.signin;
          signIn(user);
          Router.push({
            pathname: '/',
          });
        }
      });
  };
  const usernamePlaceholder = t('signin.form.usernamePlaceholder');

  return (
    <CssVarsProvider defaultMode="dark" disableTransitionOnChange>
      <BackRedirect />
      <CssBaseline />
      <GlobalStyles
        styles={{
          ':root': {
            '--Collapsed-breakpoint': '769px', // form will stretch when viewport is below `769px`
            '--Cover-width': '40vw', // must be `vw` only
            '--Form-maxWidth': '700px',
            '--Transition-duration': '0.4s', // set to `none` to disable transition
          },
        }}
      />
      <Box
        sx={theme => ({
          width: 'clamp(100vw - var(--Cover-width), (var(--Collapsed-breakpoint) - 100vw) * 999, 100vw)',
          transition: 'width var(--Transition-duration)',
          transitionDelay: 'calc(var(--Transition-duration) + 0.1s)',
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'flex-end',
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(255 255 255 / 0.6)',
          [theme.getColorSchemeSelector('dark')]: {
            backgroundColor: 'rgba(19 19 24 / 0.4)',
          },
        })}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100dvh',
            width: 'clamp(var(--Form-maxWidth), (var(--Collapsed-breakpoint) - 100vw) * 999, 100%)',
            maxWidth: '100%',
            px: 2,
          }}
        >
          <Box
            component="main"
            sx={{
              my: 'auto',
              py: 2,
              pb: 5,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              width: 400,
              maxWidth: '100%',
              mx: 'auto',
              borderRadius: 'sm',
              '& form': {
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              },
              [`& .${formLabelClasses.asterisk}`]: {
                visibility: 'hidden',
              },
            }}
          >
            <div>
              <Typography component="h2" fontSize="xl2" fontWeight="lg">
                {ready && t('signin.title')}
              </Typography>
              <Typography level="body2" sx={{ my: 1, mb: 3 }}>
                {ready && t('signin.message')}
              </Typography>
            </div>
            <form
              onSubmit={(event: React.FormEvent<SignInFormElement>) => {
                event.preventDefault();
                const formElements = event.currentTarget.elements;
                const data = {
                  username: formElements.username.value,
                  password: formElements.password.value,
                };
                handleSubmit(data.username, data.password);
              }}
            >
              <FormControl required>
                <FormLabel aria-label="Enter your username">{t('signin.form.username')}</FormLabel>
                <Input placeholder={usernamePlaceholder} type="username" name="username" />
              </FormControl>
              <FormControl required>
                <FormLabel>{t('signin.form.password')}</FormLabel>
                <Input placeholder="•••••••" type="password" name="password" aria-label={'password'} />
              </FormControl>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              ></Box>
              <Button type="submit" fullWidth aria-label="signin">
                {ready && t('signin.form.signin')}
              </Button>
            </form>
            <Box display="flex" justifyContent="flex-end">
              <Link href="/signup">
                <Typography fontSize="sm" fontWeight="lg" color="primary">
                  New to Baskin? Sign up →
                </Typography>
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box
        sx={theme => ({
          height: '100%',
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          left: 'clamp(0px, (100vw - var(--Collapsed-breakpoint)) * 999, 100vw - var(--Cover-width))',
          transition:
            'background-image var(--Transition-duration), left var(--Transition-duration) !important',
          transitionDelay: 'calc(var(--Transition-duration) + 0.1s)',
          backgroundColor: 'background.level1',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundImage: 'url(https://images.unsplash.com/photo-1527181152855-fc03fc7949c8)',
          [theme.getColorSchemeSelector('dark')]: {
            backgroundImage: 'url(https://images.unsplash.com/photo-1572072393749-3ca9c8ea0831)',
          },
        })}
      />
    </CssVarsProvider>
  );
}
