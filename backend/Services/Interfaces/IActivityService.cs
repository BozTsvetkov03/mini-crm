using Backend.Dtos;
using Backend.Models;

namespace Backend.Services;

public interface IActivityService
{
    Task CreateAsync(Activity activity);

    // Returns null when the customer doesn't exist or isn't owned by userId
    Task<IEnumerable<ActivityDto>?> GetByCustomerAsync(Guid customerId, Guid userId);
}
