export async function POST(req: Request) {
  try {
    const errorDetails = await req.text();
    console.log('BROWSER_ERROR_CAPTURED:', errorDetails);
  } catch (e) {
    console.log('BROWSER_ERROR_FAILED_TO_PARSE');
  }
  return new Response('OK');
}
