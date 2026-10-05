export type CloudProvider = "gcp" | "aws";

const CLOUD_URLS: Record<CloudProvider, string> = {
  gcp: "http://34.111.178.15",

  aws: "http://a241e6eacdf6d4edba51d6f243097e7f-1504230815.ap-south-1.elb.amazonaws.com",
};

export interface UrlResponse {
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  createdAt: string;
  expiresAt: string | null;
  clickCount: number;
}

function getApiBaseUrl(
  cloud: CloudProvider
): string {
  return CLOUD_URLS[cloud];
}

export async function getAllUrls(
  cloud: CloudProvider
): Promise<UrlResponse[]> {

  const response = await fetch(
    `${getApiBaseUrl(cloud)}/api/urls`
  );

  if (!response.ok) {
    throw new Error(
      `Unable to load URLs from ${cloud}`
    );
  }

  return response.json();
}

export async function createShortUrl(
  cloud: CloudProvider,
  originalUrl: string
): Promise<UrlResponse> {

  const response = await fetch(
    `${getApiBaseUrl(cloud)}/api/urls`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        originalUrl,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to create URL on ${cloud}`
    );
  }

  return response.json();
}

export async function deleteUrl(
  cloud: CloudProvider,
  shortCode: string
): Promise<void> {

  const response = await fetch(
    `${getApiBaseUrl(cloud)}/api/urls/${shortCode}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to delete URL from ${cloud}`
    );
  }
}