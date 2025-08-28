using Microsoft.Data.SqlClient;
using System.Data;

namespace CATnTRACE_API
{
    public class Helper
    {

  
        public static bool GetBoolValue(string value)
        {
            return value.Length > 0 ? bool.Parse(value) : false;
        }

        public static int GetIntValue(string value)
        {
            return value.Length > 0 ? int.Parse(value) : 0;
        }

        public static long GetLongValue(string value)
        {
            return value.Length > 0 ? long.Parse(value) : 0;
        }

        public static float GetFloatValue(string value)
        {
            return value.Length > 0 ? float.Parse(value) : 0;
        }

        public static DateTime GetDateTimeValue(string value)
        {
            DateTime dateTime;
            return DateTime.TryParse(value, out dateTime) ? DateTime.Parse(value) : new DateTime();
        }
        private string GetOPS_STATUS(string ops_status,Boolean IsPolish)
        {
            switch (ops_status)
            {
                case "0":
                    return IsPolish ? "Rezerwacja" : "Booking";
                case "1":
                    return IsPolish ? "Planowane" : "Planned";
                case "2":
                    return IsPolish ? "W realizacji" : "In Charge";
                case "3":
                    return IsPolish ? "W trakcie" : "In Progress";
                case "4":
                    return IsPolish ? "Odrzucone" : "Rejected";
                case "5":
                    return IsPolish ? "Zrealizowane" : "Realised";
                case "6":
                    return IsPolish ? "Zawieszone" : "Suspended";
                case "7":
                    return IsPolish ? "Przeplanowane" : "Replanned";
                case "8":
                    return IsPolish ? "Odrzucone przez klienta" : "Rejected By Customer";
                case "9":
                    return IsPolish ? "Przeplanowane przez klienta" : "Replanned By Customer";
                default:
                    return null;
            }
        }
        public void CloseSqlConnection(SqlConnection conn)
        {
            if (conn == null || conn.State != ConnectionState.Open) return;
            conn.Close();
            conn.Dispose();
            SqlConnection.ClearPool(conn);
        }
    }
}
