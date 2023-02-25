import jwt from "jsonwebtoken";

const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQB4KYg8N1s+X+KmZ40KIFjgGjJnG8gRZ6hAmjkzotMaP/IuID5R
QpH37a1zOENDVOqMwPDG+GM+pWEwiqpSqJOt1F5eJrWRsATLO3vzOP07AUxcOD/e
C397IoUiGoU9M/Ktnu7/4T7S2Lfn3EB4UQRN1kuhu0KqLaK7hwYn9Rzm8Nf8oBei
nGd4kSvHN3uz+QKQxcRysaO1CJiUflHFrlIW4Q1qlpXmu20bWs58rZ6zn5OV7VOP
pluUGbezoma9q+hR7k1r9VeLflbTgutNLIHn3s+9EUtjEAIRtVMfuB6BKr7ljS7+
U5iBUC0xwwqFQXX0JlUVichMwlhVLMfS1JkbAgMBAAECggEAJaeWKpCKRkST6OOA
PhEe6LMs4kTBcDrUbdImZLj8gDhTswKlpJ9A0LmpZfbWlS3yBkOb8C38I7B9gVGi
yB5NkOaA3+4vbcUD64/raq+MI0Zn4Go8EV/3BeYuZB59bE1wGdo5OPQj1LzW/JB3
n3x75cxmjPr6jAua+Dr6weC8ut2F6rduXVkM02k39kSSsHMlVk9CfnwCjRoXNRQt
ecmaU0300GPiPLIXnaGBigMAxaUxGxVwtBWwvGso2PX7IVhP98GjZQz5HV21HQpA
muK+Q+xUkVc9uYc5lN+QVE8CGR8hIGcDnz+oLgD0yHm5UN9mOsSt6r2rr3pGh28o
5QDEMQKBgQC/UKkS7iddAkWTCmBKOGolpOKYpXz5fzPi1GKHdRQ2K9y5F8d/8ajU
qlCsHUFwVQrNz12fclRVSOnxsB8Ol6Ot/7WVeb71IhH1VNSZwhuLps8kqDouvRHA
QqDAcs/Utlef2XzY5RRxnsvrK0mk47Ih1eQO1ivgcszPNzyEXfJXGQKBgQCgyjbA
onbu9TdsUVVHyGVxg8HakYDKQdbmZoDNXomHXsD3JBe8/DYOLgl75GIcor3sc7j6
ljqd8fx2hV3F06S2n9XhFeVh/wjAi8PTWu7xNbkKbsFCaKCKoUfwoMZAvaiS98S/
FAH95ALCLPxVziB8Xdh12Og6VR3pINv6dSy8UwKBgQCGasfAEy/4+0Wi4CFzRFvg
Aw9qLKu4KJVuA8cOYUZIIV09duWmkUYL1XZE13FI2ZdzrwSaqJt0KHymYRYRDJ3l
/Mm6MgXm+X8gne+Z8HWmExdrK/9lI1Y7fRSw4nn/e/Xoy8gaJCnPAsFHg+yEO67G
cx9/BR9i3YXk+Ww9nDxO0QKBgDp/19PWSDdAeF2sab6oJmBac5k1/wmXUryY5pvR
nW/nBYXlV82mZXRbQ5AT065fd4IjyFVDeygj9pqYgzmKew8GsCYodUBmLaUANMsc
9npD9YLaMO4cauyFKUte80JyvnZaNvbeLKtW3boP6+68BA27hxm5RSST+0Hqdp51
K0WJAoGBAJG4eGE2rCad9Mq3/hOXGRm7ug8Zs7Rv0/fib509nGnvKDvhajDN0dgK
jqRm9Ec4rKdeleQQI981Bonzvcdp31bPZCiaP3blTwxY7Rh/RCCWREhHCJ4qfj8n
gKAmLjy5CfRADuE2tAvQO9IvkYZ3mbkyKeEJJJ7kHDIiafO5EDNp
-----END RSA PRIVATE KEY-----`;

const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBITANBgkqhkiG9w0BAQEFAAOCAQ4AMIIBCQKCAQB4KYg8N1s+X+KmZ40KIFjg
GjJnG8gRZ6hAmjkzotMaP/IuID5RQpH37a1zOENDVOqMwPDG+GM+pWEwiqpSqJOt
1F5eJrWRsATLO3vzOP07AUxcOD/eC397IoUiGoU9M/Ktnu7/4T7S2Lfn3EB4UQRN
1kuhu0KqLaK7hwYn9Rzm8Nf8oBeinGd4kSvHN3uz+QKQxcRysaO1CJiUflHFrlIW
4Q1qlpXmu20bWs58rZ6zn5OV7VOPpluUGbezoma9q+hR7k1r9VeLflbTgutNLIHn
3s+9EUtjEAIRtVMfuB6BKr7ljS7+U5iBUC0xwwqFQXX0JlUVichMwlhVLMfS1Jkb
AgMBAAE=
-----END PUBLIC KEY-----`;
// sign jwt
export function signJWT(payload: object, expiresIn: string | number) {
  return jwt.sign(payload, privateKey, {algorithm: "RS256", expiresIn});
}

// verify jwt
export function verifyJWT(token: string) {
  try {
    const decoded = jwt.verify(token, publicKey);
    return { payload: decoded, expired: false };
  } catch (err) {
    if (err instanceof Error) {
      return { payload: null, expired: err.message.includes("jwt expired") };
    } else {
      console.log('Unexpected error', err);
      return {payload: null, expired: true}
    }
  }
}