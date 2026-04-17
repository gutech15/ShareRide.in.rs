# ShareRide.in.rs

## Description
ShareRide.in.rs is a full-stack ride-sharing platform designed to facilitate cost-sharing and trip organization between drivers and passengers. Inspired by the BlablaCar concept, the application provides a complete ecosystem for creating and managing shared journeys. Users can register and create detailed profiles, search for rides using specific parameters, and manage bookings through an automated request system. The platform includes a real-time communication module for direct coordination between travelers and an integrated rating system to build community trust.

The application handles complex trip states, including the ability for drivers to accept or reject booking requests and for passengers to track their journey status. It also features background automation for maintaining data integrity and updating ride statuses as they progress or expire.

## Technical Specifications
The backend is built on the .NET 9 framework, utilizing a Clean Architecture approach with the MediatR pattern to ensure a highly maintainable and decoupled codebase. Entity Framework Core serves as the ORM, interacting with a SQLite database for efficient data management. Real-time updates and the instant messaging system are implemented via SignalR, while secure user authentication and authorization are handled using JWT (JSON Web Tokens).
