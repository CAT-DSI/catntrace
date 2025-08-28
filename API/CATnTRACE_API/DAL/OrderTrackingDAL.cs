using CATnTRACE_API.Model;
using CATnTRACE_API.Models;
using Microsoft.AspNetCore.Connections;
using Microsoft.Data.SqlClient;
using System.Data;

namespace CATnTRACE_API.DAL
{
    public class OrderTrackingDAL
    {

        private readonly IDbConnectionFactory _connectionFactory;

        public OrderTrackingDAL(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;

        }
        public async Task<List<OrderParcelTracking>> GetOrderTrackingAsync(string orderId)
        {
            var orderTrackings = new List<OrderParcelTracking>();

            // Your existing code here

            int scalarValue = await GetCountOrderTrackingScalarAsync(orderId);
            if (scalarValue == 0)
            {
                orderTrackings.Add(new OrderParcelTracking
                {
                    ErrorMessage = "Client Order no has not been found."
                });
                return orderTrackings;
            }

            if (scalarValue > 1)
            {
                orderTrackings.Add(new OrderParcelTracking
                {
                    ErrorMessage = "An ambiguous answer. Please contact Customer Service Department."
                });
                return orderTrackings;
            }
            using (var connection = await _connectionFactory.CreateConnectionAsync())
            {

                using var command = new SqlCommand("Order_Tracking", connection);
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@order", orderId);
                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    orderTrackings.Add(new OrderParcelTracking
                    {
                        PK = reader["PK"]?.ToString() ?? string.Empty,
                        SeqNo = reader["SEQ_NO"]?.ToString() ?? string.Empty,
                        SeqType = reader["SEQ_TYPE"]?.ToString() ?? string.Empty,
                        SeqStatus = reader["SEQ_STATUS"]?.ToString() ?? string.Empty,
                    });
                }
            }

            if (orderTrackings.Count > 0)
            {
                orderTrackings = orderTrackings
                    .OrderBy(x => int.TryParse(x.SeqNo, out var n) ? n : int.MaxValue)
                    .ToList();
            }

            return orderTrackings;
        }

        public async Task<List<OrderTrackingStatus>> GetOrderTrackingBySeqAsync(string orderId, int seqNo)
        {
            var trackingStatuses = new List<OrderTrackingStatus>();

            using (var connection = await _connectionFactory.CreateConnectionAsync())
            {
                using (var command = new SqlCommand("Order_Tracking_SEQUENCE", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@Order", orderId);
                    command.Parameters.AddWithValue("@SEQ", seqNo);


                    using (var reader = await command.ExecuteReaderAsync())
                    {
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

        public async Task<int> GetCountOrderTrackingScalarAsync(string orderId)
        {

            using var connection = await _connectionFactory.CreateConnectionAsync();
            using (var command = new SqlCommand("Order_Tracking_GetCount", connection))
            {
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@order", orderId);

                var scalarValue = await command.ExecuteScalarAsync();

                if (scalarValue == null || scalarValue == DBNull.Value)
                    return 0;

                if (int.TryParse(scalarValue.ToString(), out int result))
                    return result;

                return 0;
            }
        }

    }
}