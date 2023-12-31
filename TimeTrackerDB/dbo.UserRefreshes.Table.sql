/****** Object:  Table [dbo].[UserRefreshes]    Script Date: 11/10/2023 18:15:49 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserRefreshes](
	[UserId] [int] NOT NULL,
	[ExpiresStart] [datetime2](7) NOT NULL,
	[ExpiresEnd] [datetime2](7) NOT NULL,
	[Token] [nvarchar](500) NOT NULL,
 CONSTRAINT [UQ_UserRefreshes_UserId_RefreshToken] UNIQUE NONCLUSTERED 
(
	[UserId] ASC,
	[Token] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[UserRefreshes]  WITH CHECK ADD  CONSTRAINT [FK_UserRefreshes_User] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[UserRefreshes] CHECK CONSTRAINT [FK_UserRefreshes_User]
GO
