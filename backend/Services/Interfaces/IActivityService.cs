using Backend.Models;

namespace Backend.Services;

public interface IActivityService
{
    Task CreateAsync(Activity activity);
}