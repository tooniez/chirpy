import Head from 'next/head';
import * as React from 'react';

import { useThemeVariables } from './useThemeVariables';

export type SiteThemeProviderProps = {
  children: React.ReactNode;
};

export function SiteThemeProvider(props: SiteThemeProviderProps): JSX.Element {
  const { styles } = useThemeVariables();

  return (
    <>
      <Head>
        <style key="site-theme">{styles}</style>
      </Head>
      {props.children}
    </>
  );
}
