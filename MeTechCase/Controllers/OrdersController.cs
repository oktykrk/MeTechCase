using MeTechCase.Data;
using MeTechCase.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using System.Net.Http;
using System.Threading.Tasks;
using static MeTechCase.Data.ApplicationDbContext;

namespace MeTechCase.Controllers
{
	public class OrdersController : Controller
	{
		private readonly ApplicationDbContext _dbContext;
		private readonly IHubContext<OrdersHub> _hubContext;
		public OrdersController(ApplicationDbContext dbContext, IHubContext<OrdersHub> hubContext)
		{
			_dbContext = dbContext;
			_hubContext = hubContext;
		}

		// MIGROS SIDE
		[HttpPost]
		public async Task<Order> PlaceOrder()
		{
			var newOrder = new Order
			{
				Status = "new"
			};

			_dbContext.Orders.Add(newOrder);
			await _dbContext.SaveChangesAsync();

			using var client = new HttpClient();
			await client.PostAsync("https://eovs2p9q3elb4e6.m.pipedream.net", new StringContent(JsonConvert.SerializeObject(newOrder)));

			return newOrder;
		}

		[HttpPost]
		public async Task OrderStatusUpdated([FromBody] Order order)
		{
			_dbContext.Orders.Update(order);
			await _dbContext.SaveChangesAsync();
			await _hubContext.Clients.All.SendAsync("OrderStatusUpdated", order);
		}


		// RESTAURANT SIDE
		[HttpPost]
		public async Task NewOrderPlaced([FromBody] Order order)
		{
			await _hubContext.Clients.All.SendAsync("NewOrderPlaced", order);
		}
		[HttpPost]
		public async Task UpdateOrderStatus([FromBody] Order order)
		{
			using var client = new HttpClient();
			await client.PostAsync("https://eo35qwa9zbi7oi5.m.pipedream.net", new StringContent(JsonConvert.SerializeObject(order)));
		}
	}
}
