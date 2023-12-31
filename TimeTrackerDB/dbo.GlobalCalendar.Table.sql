/****** Object:  Table [dbo].[GlobalCalendar]    Script Date: 11/10/2023 18:15:49 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[GlobalCalendar](
	[Date] [date] NOT NULL,
	[Name] [nvarchar](55) NOT NULL,
	[TypeOfGlobalEvent] [int] NOT NULL,
 CONSTRAINT [PK_GlobalCalendar] PRIMARY KEY CLUSTERED 
(
	[Date] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
