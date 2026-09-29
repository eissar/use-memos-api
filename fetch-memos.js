const MEMOS_KEY = Deno.env.get("MEMOS_KEY");
const MEMOS_BASE_URL = Deno.env.get("MEMOS_BASE_URL");
const MEMOS_PARENT = Deno.env.get("MEMOS_PARENT");
const MEMOS_STATE = Deno.env.get("MEMOS_STATE") ?? "NORMAL";
const MEMOS_PAGE_SIZE = Deno.env.get("MEMOS_PAGE_SIZE") ?? "100";

if (!MEMOS_KEY || !MEMOS_BASE_URL) {
  console.error("Error: MEMOS_KEY and MEMOS_BASE_URL environment variables must be set");
  Deno.exit(1);
}

const headers = {
  Authorization: `Bearer ${MEMOS_KEY}`,
};

async function getAuthedUserName() {
  const authUrl = `${MEMOS_BASE_URL}/api/v1/auth/me`;
  const response = await fetch(authUrl, {
    headers,
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`Error resolving user: ${response.status} ${response.statusText}`);
    console.error(body);
    Deno.exit(1);
  }

  const user = (await response.json())?.user;
  if (!user?.name) {
    console.error("Error: auth/me did not return a user name");
    Deno.exit(1);
  }

  return user.name;
}

const parent = MEMOS_PARENT ?? (await getAuthedUserName());
const memosUrl = new URL(`${MEMOS_BASE_URL}/api/v1/memos`);
memosUrl.searchParams.set("parent", parent);
memosUrl.searchParams.set("state", MEMOS_STATE);
memosUrl.searchParams.set("pageSize", MEMOS_PAGE_SIZE);

let nextPageToken = "";
const allMemos = [];

do {
  if (nextPageToken) {
    memosUrl.searchParams.set("pageToken", nextPageToken);
  } else {
    memosUrl.searchParams.delete("pageToken");
  }

  const response = await fetch(memosUrl.toString(), { headers, signal: AbortSignal.timeout(15000) });
  if (!response.ok) {
    const body = await response.text();
    console.error(`Error fetching memos: ${response.status} ${response.statusText}`);
    console.error(body);
    Deno.exit(1);
  }

  const page = await response.json();
  allMemos.push(...(page.memos ?? []));
  nextPageToken = page.nextPageToken ?? "";
} while (nextPageToken);

console.log(JSON.stringify({ memos: allMemos, total: allMemos.length }, null, 2));
