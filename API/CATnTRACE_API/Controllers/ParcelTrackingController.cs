using CATnTRACE_API.DAL;
using CATnTRACE_API.Model;
using CATnTRACE_API.Models;
using Microsoft.AspNetCore.Mvc;

namespace CATnTRACE_API.Controllers
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class ParcelTrackingController : Controller
    {
        private readonly ParcelTrackingDAL _dal;

        public ParcelTrackingController(ParcelTrackingDAL parcelTrackingService)
        {
            
            _dal = parcelTrackingService;
        }

        [HttpGet("{parcelId}")]
        public async Task<ActionResult<IEnumerable<OrderParcelTracking>>> GetParcelTracking(string parcelId)
        {
            var orderTrackings = await _dal.GetParcelTrackingAsync(parcelId);
            return Ok(orderTrackings);
        }

        [HttpGet("by-seq")]
        public async Task<ActionResult<IEnumerable<OrderTrackingStatus>>> GetParcelTrackingBySeq(string parcelId, int seqNo)
        {
            var trackingStatuses = await _dal.GetParcelTrackingBySeqAsync(parcelId, seqNo);
            return Ok(trackingStatuses);
        }
    }
}
