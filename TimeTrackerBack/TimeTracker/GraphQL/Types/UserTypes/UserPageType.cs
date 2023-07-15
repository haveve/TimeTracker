using GraphQL.Types;
using TimeTracker.Models;
using TimeTracker.ViewModels;

namespace TimeTracker.GraphQL.Types.UserTypes
{
    public class UserPageType : ObjectGraphType<UserPageViewModel>
    {
        public UserPageType() {
            Field(i => i.UserList, type: typeof(ListGraphType<UserType>));
            Field(i => i.TotalCount, type: typeof(IntGraphType));
            Field(i => i.PageIndex, type: typeof(IntGraphType));
        }
    }
}
