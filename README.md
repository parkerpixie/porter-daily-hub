# Porter Daily Hub

A manga-style visual schedule built around Porter's Google Calendar.

## Version 1

- Reads Porter's public Google Calendar through a Netlify Function
- Shows the day in Morning, Afternoon, and Evening panels
- Calculates visible open blocks between fixed appointments
- Includes a live Now / Next panel
- Includes a Sunday-through-Saturday weekly view
- Prints a one-page, letter-landscape weekly schedule for the bathroom mirror
- Refreshes the calendar every five minutes and whenever the tab regains focus

## Site

Deployed through Netlify from the `main` branch.

## Calendar

The read-only calendar connection uses Porter's public Google Calendar iCal feed. Future planning and two-way calendar writing will require authenticated Google Calendar access and should be added as a separate phase.
