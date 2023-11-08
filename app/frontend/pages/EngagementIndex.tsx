import { useEffect, useState } from 'react';

import { Box, CircularProgress, Container, Link, Stack } from '@mui/material';
import { Engagement } from 'types/engagements';

const EngagementIndex = () => {
  const [engagements, setEngagements] = useState<Engagement[] | undefined>();
  // const [rerender, setRerender] = useState({});
  useEffect(() => {
    const response = fetch(`/api/v1/engagements`);

    response
      .then(async (response) => {
        setEngagements((await response.json()) as Engagement[]);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  return (
    <Container>
      <Stack alignItems="center">
        <h2>Engagements</h2>
        {!engagements ? (
          <CircularProgress sx={{ m: 2 }} />
        ) : (
          engagements.map(({ id, name, status }) => {
            return (
              <Box key={id} display="flex" flexDirection="row">
              <Link href={`engagements/${id}/edit`}>
                {name}
              </Link>
              <div>{status}</div>
              </Box>
            );
          })
        )}
      </Stack>
    </Container>
  );
};

export default EngagementIndex;
