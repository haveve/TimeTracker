/****** Object:  Table [dbo].[VacationRequests]    Script Date: 11/10/2023 18:15:49 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[VacationRequests](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[RequesterId] [int] NOT NULL,
	[InfoAboutRequest] [nvarchar](50) NULL,
	[Status] [nvarchar](50) NOT NULL,
	[StartDate] [datetime2](7) NOT NULL,
	[EndDate] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_VacationRequests] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[VacationRequests]  WITH NOCHECK ADD  CONSTRAINT [FK_VacationRequests_Users] FOREIGN KEY([RequesterId])
REFERENCES [dbo].[Users] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[VacationRequests] NOCHECK CONSTRAINT [FK_VacationRequests_Users]
GO
