using System;
using System.Data;
using Microsoft.AspNetCore.Mvc;
using CATnTRACE_API.Models;
using CATnTRACE_API.Model;
using CATnTRACE_API.DAL;

namespace CATnTRACE_API.Controllers
{

    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class OrderTrackingController : ControllerBase
    {
        private readonly OrderTrackingDAL _dal;
        public OrderTrackingController(OrderTrackingDAL orderTrackingService)
        {
            _dal = orderTrackingService; // connectionString
        }
       
        [HttpGet("{orderId}")]
        public async Task<ActionResult<IEnumerable<OrderParcelTracking>>> GetOrderTracking(string orderId)
        {
            var orderTrackings = await _dal.GetOrderTrackingAsync(orderId);
            return Ok(orderTrackings);
        }

        [HttpGet("by-seq")]
        public async Task<ActionResult<IEnumerable<OrderTrackingStatus>>> GetOrderTrackingBySeq(string orderId, int seqNo)
        {
            var trackingStatuses = await _dal.GetOrderTrackingBySeqAsync(orderId, seqNo);
            return Ok(trackingStatuses);
        }
       
    }
}