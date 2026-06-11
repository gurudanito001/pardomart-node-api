import { PrismaClient, Role, User, Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { countries } from '../utils/countries'; // Import the local countries data

const prisma = new PrismaClient();

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Finds a user for login initiation. If the role is 'vendor', it searches across
 * 'vendor', 'store_admin', and 'store_shopper' roles.
 * @param mobileNumber The user's mobile number.
 * @param role The role provided at login.
 * @returns The user object if found, otherwise null.
 */
export const findUserForLogin = async (mobileNumber: string, role: Role): Promise<User | null> => {
  let rolesToSearch: Role[] = [role];

  // If the user is trying to log in through the generic "vendor" flow,
  // check all possible vendor-related roles.
  if (role === Role.vendor) {
    rolesToSearch = [Role.vendor, Role.store_admin, Role.store_shopper];
  }

  return prisma.user.findFirst({
    where: {
      deletedAt: null,
      mobileNumber,
      role: {
        in: rolesToSearch,
      },
    },
  });
};

/**
 * Stores a verification code for a mobile number.
 * @param mobileNumber The mobile number.
 * @param code The verification code.
 * @param tx Optional Prisma transaction client.
 */
export const storeVerificationCode = async (mobileNumber: string, code: string, tx?: Prisma.TransactionClient): Promise<void> => {
  const db = tx || prisma;
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  await db.verification.upsert({
    where: { mobileNumber },
    create: { mobileNumber, code, expiresAt, attempts: 0 },
    update: { code, expiresAt, attempts: 0 },
  });
};

/**
 * Verifies the login code and returns the user with a JWT.
 * @param mobileNumber The user's mobile number.
 * @param verificationCode The code to verify.
 * @param role The user's specific role.
 * @returns The user object and a JWT token.
 */
export const verifyCodeAndLogin = async (mobileNumber: string, verificationCode: string, role: Role) => {
  const verification = await prisma.verification.findUnique({
    where: { mobileNumber },
  });

  if (!verification || verification.code !== verificationCode) {
    throw new AuthError('Invalid verification code.');
  }

  if (new Date() > verification.expiresAt) {
    throw new AuthError('Verification code has expired.');
  }

  let user = await prisma.user.findUnique({
    where: { mobileNumber_role: { mobileNumber, role } },
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!user || user.deletedAt) {
    throw new AuthError('User not found for the specified role.');
  }

  // If mobile is not yet verified, update the user record.
  if (!user.mobileVerified) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { mobileVerified: true },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // Invalidate the code after successful verification
  await prisma.verification.delete({ where: { mobileNumber } });

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
      vendorId: user.vendorId, // Include vendorId in the token for staff roles
    },
    process.env.SECRET!,
    { expiresIn: '30d' }
  );

  return { user, token };
};

// This function is now replaced by findUserForLogin
export const checkUserExistence = async (params: { mobileNumber: string, role: Role }): Promise<boolean> => {
    const user = await findUserForLogin(params.mobileNumber, params.role);
    return !!user;
};

export interface Country {
  name: string;
  iso2: string; // ISO 3166-1 alpha-2
  dialCode: string; // E.164 country calling code with leading +
  flagPng?: string;
  flagSvg?: string;
}

/**
 * Retrieves country data from the local static JSON file.
 * Extracts and transforms raw country data into a simplified format containing
 * names, ISO codes, calling codes, and flag URLs. The result is sorted alphabetically.
 * 
 * @returns {Country[]} An array of simplified Country objects.
 */
export const getStaticCountriesData = (): Country[] => {
  if (!countries || !Array.isArray(countries.objects)) {
    console.warn('Local countries data is not in the expected format.');
    return [];
  }

  const uniqueCountriesMap = new Map<string, Country>();

  countries.objects.forEach((country: any) => {
    const name = country.names?.common || '';
    if (!name) return;

    // Deduplicate by common name to ensure no repeated entries for the same country
    if (!uniqueCountriesMap.has(name)) {
      uniqueCountriesMap.set(name, {
        name,
        iso2: country.codes?.alpha_2 || '',
        dialCode: country.calling_codes?.[0] || '',
        flagPng: country.flag?.url_png || undefined,
        flagSvg: country.flag?.url_svg || undefined,
      });
    }
  });

  return Array.from(uniqueCountriesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Fetches country data from the Rest Countries API.
 * @param search Optional search term (e.g., 'canada').
 * @param page Optional page number (defaults to 1).
 * @returns A promise that resolves to the country data.
 */
export const getCountriesFromRestCountries = async (search?: string, page: number = 3) => {
  const baseUrl = 'https://api.restcountries.com/countries/v5';
  const fields = 'names,codes,telecom,links,flag,currencies,calling_codes';
  const token = 'rc_live_c928316070224caba010c366385718dc';
  const limit = 100; // The maximum limit allowed in v5
  const offset = (page - 1) * limit;

  let url = `${baseUrl}?response_fields=${fields}&offset=${offset}&limit=${limit}`;
  if (search) {
    url += `&q=${search}`;
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`REST Countries v5 error: ${response.statusText}`);
    }

    const payload = await response.json();
    
    // Extract data safely based on standard JSON:API structures or flat arrays
    return payload.data

  } catch (error) {
    console.error('Failed to fetch countries:', error);
    throw error;
  }
};