import { ssg } from '@chirpy-dev/trpc';
import { CommonPageProps } from '@chirpy-dev/types';
import { ProjectAnalyticsProps } from '@chirpy-dev/ui';
import { GetStaticPaths, GetStaticProps } from 'next';

import { getRecentProjectStaticPathsByDomain } from '$/server/services/project';

type PathParams = {
  domain: string;
};

export const getStaticPaths: GetStaticPaths<PathParams> = async () => {
  if (process.env.DOCKER) {
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
  const paths = await getRecentProjectStaticPathsByDomain(50);

  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<
  ProjectAnalyticsProps & CommonPageProps,
  PathParams
> = async ({ params }) => {
  if (!params?.domain) {
    return { notFound: true };
  }
  const { domain } = params;
  const project = await ssg.project.byDomain.fetch(domain);
  if (!project?.id) {
    return { notFound: true };
  }

  return {
    props: {
      project,
    },
    // Only need the createdAt data
    revalidate: 24 * 60 * 60,
  };
};

export { ProjectAnalytics as default } from '@chirpy-dev/ui';
