/**
 * "Aggiorna il sito": the editor asks the developer to publish the latest changes.
 * Sends the Netlify form "richiesta-aggiornamento" on the website; Netlify e-mails the
 * developer. Publishing in the Studio saves content but does not rebuild the site by
 * itself (each rebuild costs Netlify credits), so this is the hand-off.
 */
import { CheckmarkCircleIcon } from '@sanity/icons/CheckmarkCircle';
import { Box, Button, Card, Container, Heading, Stack, Text, TextArea } from '@sanity/ui';
import { useState, type ChangeEvent } from 'react';
import { useCurrentUser } from 'sanity';
import { previewOrigin } from '../lib/env';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function RequestPublishTool() {
  const user = useCurrentUser();
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function send() {
    setStatus('sending');
    try {
      // Netlify Forms accepts URL-encoded posts; the response is opaque (cross-site).
      await fetch(`${previewOrigin}/richiesta-aggiornamento/`, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          'form-name': 'richiesta-aggiornamento',
          autore: user?.name ?? '',
          'email-autore': user?.email ?? '',
          messaggio: message.trim() || '(nessuna nota)',
        }).toString(),
      });
      setStatus('sent');
      setMessage('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <Container width={1} padding={4} paddingTop={5}>
      <Stack gap={5}>
        <Heading as="h1" size={3}>
          Aggiorna il sito
        </Heading>
        <Stack gap={3}>
          <Text>
            Gli <strong>articoli</strong> vanno online da soli: pochi minuti dopo «Publish» sono sul sito.
          </Text>
          <Text>
            Tutto il resto (home, chi sono, servizi, progetti…) lo vedi subito nella scheda <strong>Anteprima</strong>, ma
            arriva sul sito pubblico solo quando lo sviluppatore lo aggiorna. Quando hai finito, mandagli una richiesta da
            qui.
          </Text>
        </Stack>

        <Stack gap={3}>
          <Text as="label" htmlFor="richiesta-messaggio" weight="semibold" size={1}>
            Cosa hai modificato? (facoltativo)
          </Text>
          <TextArea
            id="richiesta-messaggio"
            rows={5}
            value={message}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setMessage(event.currentTarget.value)}
            placeholder="Es.: nuovo progetto sulle dune, corretto il testo di Chi sono."
          />
        </Stack>

        <Box>
          <Button
            tone="primary"
            text={status === 'sending' ? 'Invio in corso…' : 'Chiedi di aggiornare il sito'}
            disabled={status === 'sending'}
            onClick={send}
          />
        </Box>

        {status === 'sent' && (
          <Card padding={3} radius={2} tone="positive">
            <Text>
              <CheckmarkCircleIcon /> Richiesta inviata. Lo sviluppatore riceverà un’email.
            </Text>
          </Card>
        )}
        {status === 'error' && (
          <Card padding={3} radius={2} tone="critical">
            <Text>Invio non riuscito: controlla la connessione e riprova, oppure scrivi direttamente allo sviluppatore.</Text>
          </Card>
        )}
      </Stack>
    </Container>
  );
}
