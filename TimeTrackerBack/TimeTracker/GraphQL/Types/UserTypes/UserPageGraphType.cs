using GraphQL.Types;
using TimeTracker.ViewModels;

namespace TimeTracker.GraphQL.Types.UserTypes
{
    public class UserPageGraphType : ObjectGraphType<UserPageViewModel>
    {
        public UserPageGraphType()
        {
            Field(i => i.UserList, type: typeof(ListGraphType<UserGraphType>));
            Field(i => i.TotalCount, type: typeof(IntGraphType));
            Field(i => i.PageIndex, type: typeof(IntGraphType));
        }
    }
}
