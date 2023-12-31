/****** Object:  Table [dbo].[ApproversSetup]    Script Date: 11/10/2023 18:15:49 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ApproversSetup](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[UserIdApprover] [int] NOT NULL,
	[UserIdRequester] [int] NOT NULL,
 CONSTRAINT [PK_Approvers] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[ApproversSetup]  WITH CHECK ADD  CONSTRAINT [FK_Approvers_Users] FOREIGN KEY([UserIdRequester])
REFERENCES [dbo].[Users] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ApproversSetup] CHECK CONSTRAINT [FK_Approvers_Users]
GO
ALTER TABLE [dbo].[ApproversSetup]  WITH NOCHECK ADD  CONSTRAINT [FK_Approvers_Users1] FOREIGN KEY([UserIdApprover])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[ApproversSetup] NOCHECK CONSTRAINT [FK_Approvers_Users1]
GO
