using System;
using System.Security.Cryptography;
using System.Text;

namespace TimeTracker.GraphQL.Types.IdentityTipes.Encryption
{
    public static class Encryption
    {
        const string IV_64 = "santhosh";

        public static string Encrypt(string strContent, string strKey)
        {
            if (string.IsNullOrEmpty(strContent)) return string.Empty;
            if (strKey.Length > 8) strKey = strKey.Substring(0, 8); else throw new InvalidDataException("length of key must be not less than 8");
            byte[] byKey = System.Text.ASCIIEncoding.ASCII.GetBytes(strKey);
            byte[] byIV = System.Text.ASCIIEncoding.ASCII.GetBytes(IV_64);
            DESCryptoServiceProvider cryptoProvider = new DESCryptoServiceProvider();
            int i = cryptoProvider.KeySize;
            MemoryStream ms = new MemoryStream();
            CryptoStream cst = new CryptoStream(ms, cryptoProvider.CreateEncryptor(byKey, byIV), CryptoStreamMode.Write);
            StreamWriter sw = new StreamWriter(cst);
            sw.Write(strContent);
            sw.Flush();
            cst.FlushFinalBlock();
            sw.Flush();
            return Convert.ToBase64String(ms.GetBuffer(), 0, (int)ms.Length);
        }
        public static string Decrypt(string strContent, string strKey)
        {
            if (string.IsNullOrEmpty(strContent)) return string.Empty;
            if (strKey.Length > 8) strKey = strKey.Substring(0, 8); else throw new InvalidDataException("length of key must be not less than 8");
            byte[] byKey = System.Text.ASCIIEncoding.ASCII.GetBytes(strKey);
            byte[] byIV = System.Text.ASCIIEncoding.ASCII.GetBytes(IV_64);
            byte[] byEnc;
            try
            {
                byEnc = Convert.FromBase64String(strContent);
            }
            catch
            {
                return null;
            }
            DESCryptoServiceProvider cryptoProvider = new DESCryptoServiceProvider();
            MemoryStream ms = new MemoryStream(byEnc);
            CryptoStream cst = new CryptoStream(ms, cryptoProvider.CreateDecryptor(byKey, byIV), CryptoStreamMode.Read);
            StreamReader sr = new StreamReader(cst);
            return sr.ReadToEnd();
        }
    }
}
