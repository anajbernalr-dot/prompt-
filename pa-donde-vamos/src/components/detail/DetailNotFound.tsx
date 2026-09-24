import { Button } from '@/components/Button';
import { goBack, Header } from '@/components/Header';
import type { IconName } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/Surfaces';

/** Shown when a place/event id in the URL doesn't exist. */
export function DetailNotFound({
  title,
  body,
  icon = 'map-pin',
  fallback = '/',
}: {
  title: string;
  body: string;
  icon?: IconName;
  fallback?: string;
}) {
  return (
    <Screen>
      <Header fallback={fallback} />
      <EmptyState
        icon={icon}
        title={title}
        body={body}
        action={
          <Button
            label="Volver"
            iconLeft="arrow-left"
            size="md"
            fullWidth={false}
            onPress={() => goBack(fallback)}
            style={{ alignSelf: 'center', marginTop: 10 }}
          />
        }
      />
    </Screen>
  );
}
