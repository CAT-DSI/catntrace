using CATnTRACE_API.Model;
using CATnTRACE_API.Models;
using Microsoft.Data.SqlClient;
using System.Data;
namespace CATnTRACE_API.DAL
{
    public class ParcelTrackingDAL
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public ParcelTrackingDAL(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;

        }

        public async Task<List<OrderParcelTracking>> GetParcelTrackingAsync(string parcelId)
        {
            var orderTrackings = new List<OrderParcelTracking>();

            int scalarValue = await GetCountParcelTrackingScalarAsync(parcelId);
            if (scalarValue == 0)
            {
                orderTrackings =
                [
                    new() {
                        ErrorMessage = "Parcel has not been found."
                    }
                ];
                return orderTrackings;
            }

            if (scalarValue > 1)
            {
                orderTrackings =
                [
                    new() {
                        ErrorMessage = "An ambiguous answer. Please contact Customer Service Department."
                    }
                ];
                return orderTrackings;
            }

            using (var connection = await _connectionFactory.CreateConnectionAsync())
            {
                using var command = new SqlCommand("Parcel_Tracking", connection);
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@Parcel", parcelId);

                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        orderTrackings.Add(new OrderParcelTracking
                        {
                            PK = reader["PK"]?.ToString() ?? string.Empty,
                            SeqNo = reader["SEQ_NO"]?.ToString() ?? string.Empty,
                            SeqType = reader["SEQ_TYPE"]?.ToString() ?? string.Empty,
                            SeqStatus = reader["SEQ_STATUS"]?.ToString() ?? string.Empty,
                            IsDone = reader["IS_DONE"]?.ToString() ?? string.Empty,
                        });
                    }
                }
            }
            if (orderTrackings.Count > 0)
            {
                orderTrackings = [.. orderTrackings.OrderBy(x => int.TryParse(x.SeqNo, out var n) ? n : int.MaxValue)];
            }

            return orderTrackings;
        }

        public async Task<List<OrderTrackingStatus>> GetParcelTrackingBySeqAsync(string parcelId, int seqNo)
        {
            var trackingStatuses = new List<OrderTrackingStatus>();

            using (var connection = await _connectionFactory.CreateConnectionAsync())
            {
                using var command = new SqlCommand("Parcel_Tracking_SEQUENCE", connection);
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@Parcel", parcelId);
                command.Parameters.AddWithValue("@SEQ", seqNo);


                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {

                    trackingStatuses.Add(new OrderTrackingStatus
                    {
                        PK = reader["PK"]?.ToString() ?? string.Empty,
                        OrderDateTime = reader["ACTUAL_END_DATE"] != DBNull.Value
                              ? Helper.GetDateTimeValue(reader["ACTUAL_END_DATE"]?.ToString() ?? string.Empty)
                              : reader["PLANNED_START_DATE"] != DBNull.Value
                                  ? Helper.GetDateTimeValue(reader["PLANNED_START_DATE"]?.ToString() ?? string.Empty)
                                  : DateTime.MinValue,
                        OrderStatus = reader["IS_DONE"]?.ToString() ?? string.Empty,
                        SiteName = reader["SITE_NAME"]?.ToString() ?? string.Empty,
                        ParcelNumber = reader["BARCODE_EXT_ID"]?.ToString() ?? string.Empty
                    });
                }

            }
            if (trackingStatuses.Count > 0)
            {
                trackingStatuses = trackingStatuses
                    .OrderByDescending(x => int.TryParse(x.OrderStatus, out var n) ? n : int.MaxValue)
                    .ToList();
            }
            return trackingStatuses;
        }

        public async Task<int> GetCountParcelTrackingScalarAsync(string parcelId)
        {
            using var connection = await _connectionFactory.CreateConnectionAsync();
            using var command = new SqlCommand("Parcel_Tracking_GetCount", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@Parcel", parcelId);

            var scalarValue = await command.ExecuteScalarAsync();

            if (scalarValue == null || scalarValue == DBNull.Value)
                return 0;

            if (int.TryParse(scalarValue.ToString(), out int result))
                return result;

            return 0;
        }
    }
}
